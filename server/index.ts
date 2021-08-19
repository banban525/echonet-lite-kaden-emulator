import express from "express";
import EL, { eldata, InitializeOptions, rinfo } from "echonet-lite";
import { Controller, EchoObject, ILogger } from "./controller";
import os from "os";
import ip from "ip";

let echonetTargetNetwork = ""; //"192.168.1.0/24";
let debugLog = false;

if (
  "ECHONET_TARGET_NETWORK" in process.env &&
  process.env.ECHONET_TARGET_NETWORK !== undefined
) {
  echonetTargetNetwork = process.env.ECHONET_TARGET_NETWORK;
}
if ("DEBUG" in process.env && process.env.DEBUG !== undefined) {
  debugLog =
    process.env.DEBUG.toUpperCase() === "TRUE" || process.env.DEBUG === "1";
}

class Logger implements ILogger {
  private logOut: boolean;
  constructor(logOut: boolean) {
    this.logOut = logOut;
  }
  log(log: string): void {
    if (this.logOut === false) {
      return;
    }
    console.log(new Date().toISOString() + "\t" + log);
  }
  dir(obj: any, options?: NodeJS.InspectOptions): void {
    if (this.logOut === false) {
      return;
    }
    console.dir(obj, options);
  }
}

const logger = new Logger(debugLog);

const app = express();
const controller = new Controller(logger);

app.use(express.static("build"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/status", controller.getStatus);
app.get("/api/cellingLight", controller.getCellingLightStatus);
app.post("/api/cellingLight", controller.setCellingLightStatusFromRestApi);
app.get("/api/sensorMeter", controller.getSensorMeterStatus);
app.post("/api/sensorMeter", controller.setSensorMeterStatusFromRestApi);
app.get("/api/motionSensor", controller.getMotionSensorStatus);
app.post("/api/motionSensor", controller.setMotionSensorStatusFromRestApi);
app.get("/api/floorLight", controller.getFloorLightStatus);
app.post("/api/floorLight", controller.setFloorLightStatusFromRestApi);
app.get("/api/shutter", controller.getShutterStatus);
app.post("/api/shutter", controller.setShutterStatusFromRestApi);
app.get("/api/door", controller.getDoorStatus);
app.post("/api/door", controller.setDoorStatusFromRestApi);
app.get("/api/bathWaterHeater", controller.getBathWaterHeaterStatus);
app.post(
  "/api/bathWaterHeater",
  controller.setBathWaterHeaterStatusFromRestApi
);
app.get("/api/airConditioner", controller.getAirConditionerStatus);
app.post("/api/airConditioner", controller.setAirConditionerStatusFromRestApi);

const server = app.listen(3000, function () {
  const address = server.address();
  const port =
    address === null
      ? "null"
      : typeof address === "string"
      ? address
      : address.port;

  console.log(`Start listening to web server. 0.0.0.0:${port}`);
});

let usedIpByEchoNet = "";
if (echonetTargetNetwork.match(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\/[0-9]+/)) {
  const interfaces = os.networkInterfaces();
  const matchedNetworkAddresses = Object.keys(interfaces)
    .map((key) => interfaces[key])
    .flat()
    .filter((_) => ip.cidrSubnet(echonetTargetNetwork).contains(_.address));
  if (matchedNetworkAddresses.length >= 1) {
    usedIpByEchoNet = matchedNetworkAddresses[0].address;
  }
}

controller.sendPropertyChangedEvent = (
  echoObject: EchoObject,
  seoj: string,
  propertyNo: string,
  newValue: number[]
): void => {
  logger.log(`INF seoj:${seoj} propertyCode:${propertyNo} ${newValue}`);
  EL.sendOPC1(EL.EL_Multi, seoj, "05FF01", EL.INF, propertyNo, newValue);
};

const echoObjectList = controller.allStatusList
  .map((_) => _.echoObject)
  .map((_) => Object.keys(_))
  .flat();

const options: InitializeOptions = {
  //autoGetProperties: true,
  autoGetDelay: 100,
};
if (usedIpByEchoNet !== "") {
  options.v4 = usedIpByEchoNet;
}

EL.initialize(
  echoObjectList,
  (rinfo: rinfo, els: eldata): void => {
    //const a = JSON.stringify(rinfo);
    const b = JSON.stringify(els);
    logger.log(`recieved:` + b);

    //GET
    if (els.ESV === EL.GET) {
      const matchedEchoObjects = controller.allStatusList.filter(
        (_) => els.DEOJ in _.echoObject
      );
      for (const status of matchedEchoObjects) {
        for (const propertyCode in els.DETAILs) {
          if (propertyCode in status.echoObject[els.DEOJ]) {
            const value = status.echoObject[els.DEOJ][propertyCode];

            EL.sendOPC1(
              rinfo.address,
              els.DEOJ,
              EL.toHexArray(els.SEOJ),
              EL.GET_RES,
              propertyCode,
              value
            );
          }
        }
      }
    }
    //SET with no response
    if (els.ESV === EL.SETI) {
      const matchedEchoObjects = controller.allStatusList.filter(
        (_) => els.DEOJ in _.echoObject
      );
      for (const status of matchedEchoObjects) {
        for (const propertyCode in els.DETAILs) {
          controller.setValueFromEchoNet(
            status.echoObject,
            propertyCode,
            EL.toHexArray(els.DETAILs[propertyCode])
          );
        }
      }
    }

    //SET with response
    if (els.ESV === EL.SETC) {
      const matchedEchoObjects = controller.allStatusList.filter(
        (_) => els.DEOJ in _.echoObject
      );
      for (const status of matchedEchoObjects) {
        for (const propertyCode in els.DETAILs) {
          const result = controller.setValueFromEchoNet(
            status.echoObject,
            propertyCode,
            EL.toHexArray(els.DETAILs[propertyCode])
          );
          if (result) {
            EL.sendOPC1(
              rinfo.address,
              els.DEOJ,
              EL.toHexArray(els.SEOJ),
              EL.SET_RES,
              propertyCode,
              []
            );
          }
        }
      }
    }
  },
  4,
  options
);

console.log(`Start ECHONET Lite to network interface:${EL.usingIF.v4}`);

//EL.search();

// EL.setObserveFacilities(1000, () => {
//   console.dir(EL.facilities);
// });
