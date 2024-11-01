import express from "express";
import EL, { eldata, InitializeOptions, rinfo } from "echonet-lite";
import { Controller, EchoObject, EchoStatus, ILogger } from "./controller";
import os from "os";
import ip from "ip";
import fs from "fs";
import { Settings } from "./Settings";

let echonetTargetNetwork = ""; //"192.168.1.0/24";
let echonetDelayTime = 0;
let debugLog = false;
let webPort = 3000;
let settingsFilePath = "";
let settings: Settings = Settings.createEmpty();

if (
  "ECHONET_TARGET_NETWORK" in process.env &&
  process.env.ECHONET_TARGET_NETWORK !== undefined
) {
  echonetTargetNetwork = process.env.ECHONET_TARGET_NETWORK;
}
if (
  "ECHOENT_DELAY_TIME" in process.env &&
  process.env.ECHOENT_DELAY_TIME !== undefined
) {
  echonetDelayTime = parseInt(process.env.ECHOENT_DELAY_TIME);
}
if ("DEBUG" in process.env && process.env.DEBUG !== undefined) {
  debugLog =
    process.env.DEBUG.toUpperCase() === "TRUE" || process.env.DEBUG === "1";
}
if ("WEBPORT" in process.env && process.env.WEBPORT !== undefined) {
  webPort = parseInt(process.env.WEBPORT);
}
if (
  "SETTINGS" in process.env && process.env.SETTINGS !== undefined) {
  settingsFilePath = process.env.SETTINGS;
}

if (echonetDelayTime > 0) {
  console.log(`ECHOENT_DELAY_TIME:${echonetDelayTime}`);
}
if (debugLog) {
  console.log(`DEBUG:${debugLog}`);
}
if(settingsFilePath !== "")
{
  console.log(`SETTINGS:${settingsFilePath}`);
}
if(fs.existsSync(settingsFilePath)){
  settings = JSON.parse(fs.readFileSync(settingsFilePath, "utf-8")) as Settings;
  const validationResult = Settings.validate(settings);
  if(validationResult.valid === false)
  {
    console.error("Invalid settings file.");
    console.error(validationResult.message);
    process.exit(1);
  }
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
const controller = new Controller(logger, settings);

app.use(express.static("public"));

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

app.post("/api/commands/:command", controller.postCommandsFromRestApi);

const server = app.listen(webPort, function () {
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
  echoStatus: EchoStatus,
  seoj: string,
  propertyNo: string,
  newValue: number[]
): void => {
  logger.log(`INF seoj:${seoj} propertyCode:${propertyNo} ${newValue}`);
  EL.sendOPC1(EL.EL_Multi, seoj, "05FF01", EL.INF, propertyNo, newValue);
};

controller.sendCommandCallback = (command: string, option:any): void => {
  if (command === "instanceListNotification") {
    logger.log(`send instanceListNotification`);
    EL.sendOPC1(EL.EL_Multi, "0ef001", "0ef001", EL.INF, "d5", EL.Node_details["d5"]);
  }
  if(command === "changedevices")
  {
    const arr = option as {eoj:string, enabled:boolean}[];
    for(const elem of arr)
    {
      const echoStatus = controller.allStatusList.find(_=>_.eoj === elem.eoj);
      if(echoStatus === undefined)
      {
        continue;
      }
      if(echoStatus.enabled !== elem.enabled)
      {
        echoStatus.enabled = elem.enabled;
        console.log(`Changed ${elem.eoj} to ${elem.enabled}`);
      }
    }
    recreateEchoObjectList();
    //EL.sendOPC1(EL.EL_Multi, "0ef001", "0ef001", EL.INF, "d5", EL.Node_details["d5"]);
  }
};

function recreateEchoObjectList(): void {
  const echoObjectList = controller.allStatusList
    .filter(_=>_.enabled)
    .map((_) => _.echoObject)
    .map((_) => Object.keys(_))
    .flat();
  
  EL.EL_obj = echoObjectList;

	// クラスリストにする
	let classes = EL.EL_obj.map((e)=>e.substr(0, 4));
	let classList = classes.filter(function (x, i, self) {		// 重複削除
		return self.indexOf(x) === i;
	});
	EL.EL_cls = classList;

  // インスタンスリスト
  {
    EL.Node_details["d3"] = [0x00, 0x00, EL.EL_obj.length]; // D3はノードプロファイル入らない，最大253では？なぜ3Byteなのか？
	  const v = EL.EL_obj.flatMap((elem)=>EL.toHexArray(elem));
	  v.unshift(EL.EL_obj.length);
	  EL.Node_details["d5"] = Array.prototype.concat.apply([], v);  // D5, D6同じでよい．ノードプロファイル入らない．
	  EL.Node_details["d6"] = EL.Node_details["d5"];
  }

	// クラス情報
  {
  	EL.Node_details["d4"] = [0x00, EL.EL_cls.length + 1]; // D4だけなぜかノードプロファイル入る．
	  const v = EL.EL_cls.flatMap((elem)=>EL.toHexArray(elem));
	  v.unshift(EL.EL_cls.length);
	  EL.Node_details["d7"] = Array.prototype.concat.apply([], v);  // D7はノードプロファイル入らない
  }
}

const echoObjectList = controller.allStatusList
  .filter(_=>_.enabled)
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

let sleeping = false;

async function sleep(msec: number): Promise<void> {
  if (msec === 0) {
    return;
  }
  return new Promise((resolve) => setTimeout(resolve, msec));
}

async function userFunc(rinfo: rinfo, els: eldata): Promise<void> {
  //const a = JSON.stringify(rinfo);
  const b = JSON.stringify(els);
  logger.log(`recieved:` + b);

  if (sleeping) {
    // スリープ中に来たコマンドはエラーを返す
    if (els.ESV === EL.GET) {
      for (const propertyCode in els.DETAILs) {
        EL.sendOPC1(
          rinfo.address,
          els.DEOJ,
          EL.toHexArray(els.SEOJ),
          EL.GET_SNA,
          propertyCode,
          []
        );
      }
      return;
    }
    if (els.ESV === EL.SETC) {
      for (const propertyCode in els.DETAILs) {
        EL.sendOPC1(
          rinfo.address,
          els.DEOJ,
          EL.toHexArray(els.SEOJ),
          EL.SETC_SNA,
          propertyCode,
          []
        );
      }
      return;
    }

    // スリープ中に来たSETIコマンドは無視する
    if (els.ESV === EL.SETI) {
      return;
    }
  }

  //GET
  if (els.ESV === EL.GET) {
    const matchedEchoObjects = controller.allStatusList.filter(
      (_) => _.enabled && els.DEOJ in _.echoObject
    );
    for (const status of matchedEchoObjects) {
      for (const propertyCode in els.DETAILs) {
        if (propertyCode in status.echoObject[els.DEOJ]) {
          const value = status.echoObject[els.DEOJ][propertyCode];

          logger.log(`Requested: ${els.DEOJ} ${propertyCode}`);
          sleeping = true;
          await sleep(echonetDelayTime);
          sleeping = false;

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
    // SETIの処理
    const matchedEchoObjects = controller.allStatusList.filter(
      (_) => _.enabled && els.DEOJ in _.echoObject
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
    // SETCの処理
    const matchedEchoObjects = controller.allStatusList.filter(
      (_) => _.enabled && els.DEOJ in _.echoObject
    );
    for (const status of matchedEchoObjects) {
      for (const propertyCode in els.DETAILs) {
        const result = controller.setValueFromEchoNet(
          status.echoObject,
          propertyCode,
          EL.toHexArray(els.DETAILs[propertyCode])
        );
        if (result) {
          sleeping = true;
          await sleep(echonetDelayTime);
          sleeping = false;

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
}

EL.initialize(echoObjectList, userFunc, 4, options);
if(settings.nodeProfileId !== undefined && settings.nodeProfileId !== "")
{
  EL.Node_details["83"] = EL.toHexArray(settings.nodeProfileId);
}

console.log(`Start ECHONET Lite to network interface:${EL.usingIF.v4}`);

//EL.search();

// EL.setObserveFacilities(1000, () => {
//   console.dir(EL.facilities);
// });
