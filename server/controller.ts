/* eslint-disable @typescript-eslint/no-var-requires */
import express from "express";
import EL from "echonet-lite";
import { Settings } from "./Settings";

export type EchoObject = { [key: string]: { [key: string]: number[] } };

export interface EchoStatus {
  eoj:string;
  echoObject: EchoObject;
  enabled:boolean;
}

interface CellingLightStatus {
  state: "on" | "off";
}

interface SensorMeterStatus {
  temp: number;
  hum: number;
}

interface MotionSensorStatus {
  state: "detected" | "notDetected";
}

interface FloorLightStatus {
  state: "on" | "off";
  color: "lamp" | "white" | "neutralWhite";
}

interface ShutterStatus {
  state: "opened" | "opening" | "halfOpen" | "closing" | "closed";
  position: number; // 0:全閉、100:全開
  move: "opening" | "stopped" | "closing";
}

interface DoorStatus {
  state: "closed" | "opened";
  lockState: "unlocked" | "locked";
}

interface BathWaterHeaterStatus {
  state: "empty" | "supply" | "drainage" | "full";
  auto: "off" | "on";
  temp: number;
  waterLevel: number; // 0:空、100:Full
}

interface AirConditionerStatus {
  state: "off" | "cool" | "heat" | "dry" | "wind";
  temp: number;
  internalMode: "cool" | "heat" | "dry" | "wind";
}

export type sendPropertyChangedMethod = (
  echoStatus: EchoStatus,
  soej: string,
  propertyNo: string,
  newValue: number[]
) => void;

export interface ILogger {
  log: (log: string) => void;
  dir: (obj: any, options?: NodeJS.InspectOptions) => void;
}

export class Controller {
  private logger: ILogger;
  private readonly settings:Settings;
  constructor(logger: ILogger, settings:Settings) {
    this.logger = logger;
    this.settings = settings;
    
    this.cellingLightEchoStatus.enabled = !(settings.devices?.monoFunctionalLighting?.disabled??false);
    this.tempSensorEchoStatus.enabled = !(settings.devices?.temperatureSensor?.disabled??false);
    this.humSensorEchoStatus.enabled = !(settings.devices?.humiditySensor?.disabled??false);
    this.motionSensorEchoStatus.enabled = !(settings.devices?.humanDetectionSensor?.disabled??false);
    this.floorLightEchoStatus.enabled = !(settings.devices?.generalLighting?.disabled??false);
    this.shutterEchoStatus.enabled = !(settings.devices?.electricallyOperatedRainSlidingDoorShutter?.disabled??false);
    this.bathWaterHeaterEchoStatus.enabled = !(settings.devices?.electricWaterHeater?.disabled??false);
    this.airConditionerEchoStatus.enabled = !(settings.devices?.homeAirConditioner?.disabled??false);
    this.doorEchoStatus.enabled = !(settings.devices?.electricLock?.disabled??false);
    this.switchEchoStatus.enabled = !(settings.devices?.switch?.disabled??false);

    this.allStatusList = [
      this.cellingLightEchoStatus,
      this.tempSensorEchoStatus,
      this.humSensorEchoStatus,
      this.motionSensorEchoStatus,
      this.floorLightEchoStatus,
      this.shutterEchoStatus,
      this.doorEchoStatus,
      this.switchEchoStatus,
      this.bathWaterHeaterEchoStatus,
      this.airConditionerEchoStatus,
    ].filter(_=>_.enabled);
    this.setCommonProperties(this.cellingLightEchoStatus.echoObject, settings.devices?.monoFunctionalLighting?.id ?? "");
    this.setCommonProperties(this.tempSensorEchoStatus.echoObject, settings.devices?.temperatureSensor?.id ?? "");
    this.setCommonProperties(this.humSensorEchoStatus.echoObject, settings.devices?.humiditySensor?.id ?? "");
    this.setCommonProperties(this.motionSensorEchoStatus.echoObject, settings.devices?.humanDetectionSensor?.id ?? "");
    this.setCommonProperties(this.floorLightEchoStatus.echoObject, settings.devices?.generalLighting?.id ?? "");
    this.setCommonProperties(this.shutterEchoStatus.echoObject, settings.devices?.electricallyOperatedRainSlidingDoorShutter?.id ?? "");
    this.setCommonProperties(this.doorEchoStatus.echoObject, settings.devices?.electricLock?.id ?? "");
    this.setCommonProperties(this.switchEchoStatus.echoObject, settings.devices?.switch?.id??"");
    this.setCommonProperties(this.bathWaterHeaterEchoStatus.echoObject, settings.devices?.electricWaterHeater?.id ?? "");
    this.setCommonProperties(this.airConditionerEchoStatus.echoObject, settings.devices?.homeAirConditioner?.id ?? "");

    setInterval(this.timer, 1000);
  }

  private sendPropertyChanged = (
    echoStatus: EchoStatus,
    eoj: string,
    propertyNo: string
  ): void => {
    if(echoStatus.enabled === false)
    {
      return;
    }
    if (propertyNo in echoStatus.echoObject[eoj] === false) {
      return;
    }

    const announcePropertyMap = echoStatus.echoObject[eoj]["9d"];
    const existsAnnounceProperty =
      announcePropertyMap
        .slice(1)
        .filter((_): boolean => _ === parseInt(propertyNo, 16)).length !== 0;

    if (existsAnnounceProperty === false) {
      return;
    }

    this.sendPropertyChangedEvent(
      echoStatus,
      eoj,
      propertyNo,
      echoStatus.echoObject[eoj][propertyNo]
    );
  };

  public sendPropertyChangedEvent: sendPropertyChangedMethod = (): void => {
    //
  };

  cellingLightStatus: CellingLightStatus = {
    state: "on"
  };
  cellingLightEchoStatus: EchoStatus = {
    enabled:true,
    eoj:"029101",
    echoObject: {
      "029101": {
        "80": [0x30],
        "9d": [0x01, 0x80], //状変アナウンスプロパティマップ
        "9e": [0x01, 0x80], //Setプロパティマップ
      },
    },
  };
  public getCellingLightStatus = (
    req: express.Request,
    res: express.Response
  ): void => {
    res.json(this.cellingLightStatus);
  };
  public setCellingLightStatus = (newStatus: CellingLightStatus): void => {
    const state = newStatus.state === "on" ? "on" : "off";
    if (this.cellingLightStatus.state !== state) {
      this.cellingLightStatus.state = state;
      this.cellingLightEchoStatus.echoObject["029101"]["80"] =
        state === "on" ? [0x30] : [0x31];
      this.sendPropertyChanged(
        this.cellingLightEchoStatus,
        "029101",
        "80"
      );
    }

    this.logger.dir(this.cellingLightStatus, { depth: 3 });
  };

  public setCellingLightStatusFromRestApi = (
    req: express.Request,
    res: express.Response
  ): void => {
    const newStatus: CellingLightStatus = {
      state: req.body.state === "on" ? "on" : "off",
    };
    this.setCellingLightStatus(newStatus);

    res.json(this.cellingLightStatus);
  };

  public setCellingLightStatusFromEchoNet = (
    echoObject: EchoObject,
    propertyCodeText: string,
    newValue: number[]
  ): boolean => {
    if (propertyCodeText === "80") {
      const state = newValue[0] === 0x30 ? "on" : "off";
      this.setCellingLightStatus({ state: state });
      return true;
    }
    return false;
  };

  sensorMeterStatus: SensorMeterStatus = {
    temp: 20.0,
    hum: 50
  };

  tempSensorEchoStatus: EchoStatus = {
    enabled:true,
    eoj:"001101",
    echoObject: {
      "001101": {
        "80": [0x30],
        e0: [0x00, 0xc8],
        "9d": [0x00], //状変アナウンスプロパティマップ
        "9e": [0x00], //Setプロパティマップ
      },
    },
  }
  humSensorEchoStatus:EchoStatus={
    enabled:true,
    eoj:"001201",
    echoObject: {
      "001201": {
        "80": [0x30],
        e0: [50],
        "9d": [0x00], //状変アナウンスプロパティマップ
        "9e": [0x00], //Setプロパティマップ
      },
    },
  };

  public getSensorMeterStatus = (
    req: express.Request,
    res: express.Response
  ): void => {
    res.json(this.sensorMeterStatus);
  };
  public setSensorMeterStatusFromRestApi = (
    req: express.Request,
    res: express.Response
  ): void => {
    let temp = req.body.temp;
    if (typeof temp === "string") {
      temp = Number(temp);
      if (isNaN(temp)) {
        temp = this.sensorMeterStatus.temp;
      }
    }
    if (typeof temp === "number" && -10 <= temp && temp <= 40) {
      if (this.sensorMeterStatus.temp !== temp) {
        this.sensorMeterStatus.temp = temp;
        this.tempSensorEchoStatus.echoObject["001101"]["e0"] = [
          (temp * 10) >> 8,
          (temp * 10) % 0x100,
        ];
        this.sendPropertyChanged(
          this.tempSensorEchoStatus,
          "001101",
          "e0"
        );

        this.airConditionerEchoStatus.echoObject["013001"]["bb"] = [temp];
        this.sendPropertyChanged(
          this.tempSensorEchoStatus,
          "001101",
          "bb"
        );
      }
    }
    let hum = req.body.hum;
    if (typeof hum === "string") {
      hum = Number(hum);
      if (isNaN(hum)) {
        hum = this.sensorMeterStatus.hum;
      }
    }
    if (typeof hum === "number" && 0 <= hum && hum <= 100) {
      if (this.sensorMeterStatus.hum !== hum) {
        this.sensorMeterStatus.hum = hum;
        this.humSensorEchoStatus.echoObject["001201"]["e0"] = [hum];
        this.sendPropertyChanged(
          this.humSensorEchoStatus,
          "001201",
          "e0"
        );
      }
    }
    this.logger.dir(this.sensorMeterStatus, { depth: 3 });

    res.json(this.sensorMeterStatus);
  };
  motionSensorStatus: MotionSensorStatus = {
    state: "detected",
  };
  motionSensorEchoStatus : EchoStatus = {
    enabled:true,
    eoj:"000701",
    echoObject: {
      "000701": {
        "80": [0x30],
        b1: [0x41],
        "9d": [0x01, 0xb1], //状変アナウンスプロパティマップ
        "9e": [0x00], //Setプロパティマップ
      },
    },
  };

  public getMotionSensorStatus = (
    req: express.Request,
    res: express.Response
  ): void => {
    res.json(this.motionSensorStatus);
  };
  public setMotionSensorStatusFromRestApi = (
    req: express.Request,
    res: express.Response
  ): void => {
    const state = req.body.state === "detected" ? "detected" : "notDetected";
    if (this.motionSensorStatus.state !== state) {
      this.motionSensorStatus.state = state;
      this.motionSensorEchoStatus.echoObject["000701"]["b1"] =
        state === "detected" ? [0x41] : [0x42];
      this.sendPropertyChanged(
        this.motionSensorEchoStatus,
        "000701",
        "b1"
      );
    }
    this.logger.dir(this.motionSensorStatus, { depth: 3 });
    res.json(this.motionSensorStatus);
  };
  floorLightStatus: FloorLightStatus = {
    state: "on",
    color: "lamp"
  };
  floorLightEchoStatus : EchoStatus = {
    enabled: true,
    eoj:"029001",
    echoObject: {
      "029001": {
        80: [0x30], //動作状態 ＯＮ＝0x30，ＯＦＦ＝0x31
        b1: [0x41], //光色設定 電球色＝ 0x41, 白色＝ 0x42, 昼白色＝0x43
        "9d": [0x01, 0x80], //状変アナウンスプロパティマップ
        "9e": [0x02, 0x80, 0xb1], //Setプロパティマップ
      },
    },
  };

  public getFloorLightStatus = (
    req: express.Request,
    res: express.Response
  ): void => {
    res.json(this.floorLightStatus);
  };

  public setFloorLightStatus = (newStatus: FloorLightStatus): void => {
    const state = newStatus.state === "on" ? "on" : "off";
    if (this.floorLightStatus.state !== state) {
      this.floorLightStatus.state = state;
      this.floorLightEchoStatus.echoObject["029001"]["80"] =
        state === "on" ? [0x30] : [0x31];
      this.sendPropertyChanged(
        this.floorLightEchoStatus,
        "029001",
        "80"
      );
    }
    const color = newStatus.color;
    if (color === "lamp") {
      this.floorLightStatus.color = "lamp";
      this.floorLightEchoStatus.echoObject["029001"]["b1"] = [0x41];
      this.sendPropertyChanged(
        this.floorLightEchoStatus,
        "029001",
        "b1"
      );
    }
    if (color === "white") {
      this.floorLightStatus.color = "white";
      this.floorLightEchoStatus.echoObject["029001"]["b1"] = [0x42];
      this.sendPropertyChanged(
        this.floorLightEchoStatus,
        "029001",
        "b1"
      );
    }
    if (color === "neutralWhite") {
      this.floorLightStatus.color = "neutralWhite";
      this.floorLightEchoStatus.echoObject["029001"]["b1"] = [0x43];
      this.sendPropertyChanged(
        this.floorLightEchoStatus,
        "029001",
        "b1"
      );
    }

    this.logger.dir(this.floorLightStatus, { depth: 3 });
  };
  public setFloorLightStatusFromRestApi = (
    req: express.Request,
    res: express.Response
  ): void => {
    const state = req.body.state === "on" ? "on" : "off";
    let color = req.body.color;
    if (color !== "lamp" && color !== "white" && color !== "neutralWhite") {
      color = "lamp";
    }

    this.setFloorLightStatus({
      state: state,
      color: color,
    });
    res.json(this.floorLightStatus);
  };
  public setFloorLightStatusFromEchoNet = (
    echoObject: EchoObject,
    propertyCodeText: string,
    newValue: number[]
  ): boolean => {
    const newStatus: FloorLightStatus = {
      state: this.floorLightStatus.state,
      color: this.floorLightStatus.color,
    };
    if (propertyCodeText === "80") {
      newStatus.state = newValue[0] === 0x30 ? "on" : "off";
      this.setFloorLightStatus(newStatus);
      return true;
    } else if (propertyCodeText === "b1") {
      newStatus.color =
        newValue[0] === 0x41
          ? "lamp"
          : newValue[0] === 0x42
          ? "white"
          : newValue[0] === 0x43
          ? "neutralWhite"
          : newStatus.color;
      this.setFloorLightStatus(newStatus);
      return true;
    }
    return false;
  };

  shutterStatus: ShutterStatus = {
    state: "opened",
    position: 100, // 0:全閉、100:全開
    move: "stopped"
  };
  shutterEchoStatus: EchoStatus ={
    enabled:true,
    eoj:"026301",
    echoObject: {
      "026301": {
        80: [0x30], //動作状態
        e0: [0x43], //開閉動作設定 開＝0x41，閉＝0x42、停止＝0x43
        ea: [0x41], //開閉状態 全開=0x41，全閉＝0x42，開動作中＝0x43，閉動作中＝0x44，途中停止＝0x45
        "9d": [0x03, 0x80, 0xe0, 0xea], //状変アナウンスプロパティマップ
        "9e": [0x01, 0xe0], //Setプロパティマップ
      },
    },
  };

  public getShutterStatus = (
    req: express.Request,
    res: express.Response
  ): void => {
    res.json(this.shutterStatus);
  };
  public setShutterStatus = (newStatus: ShutterStatus): void => {
    const move = newStatus.move;
    if (move === "opening") {
      if (
        this.shutterStatus.position < 100 &&
        this.shutterStatus.move !== "opening"
      ) {
        this.shutterStatus.state = "opening";
        this.shutterStatus.move = "opening";
        this.shutterEchoStatus.echoObject["026301"]["e0"] = [0x41]; // 開
        this.shutterEchoStatus.echoObject["026301"]["ea"] = [0x43]; // 開動作中
        this.sendPropertyChanged(this.shutterEchoStatus, "026301", "e0");
        this.sendPropertyChanged(this.shutterEchoStatus, "026301", "ea");
      }
    }
    if (move === "closing") {
      if (
        this.shutterStatus.position > 0 &&
        this.shutterStatus.move !== "closing"
      ) {
        this.shutterStatus.state = "closing";
        this.shutterStatus.move = "closing";
        this.shutterEchoStatus.echoObject["026301"]["e0"] = [0x42]; // 閉
        this.shutterEchoStatus.echoObject["026301"]["ea"] = [0x44]; // 閉動作中
        this.sendPropertyChanged(this.shutterEchoStatus, "026301", "e0");
        this.sendPropertyChanged(this.shutterEchoStatus, "026301", "ea");
      }
    }
    if (move === "stopped") {
      if (this.shutterStatus.move !== "stopped") {
        this.shutterStatus.move = "stopped";
        this.shutterEchoStatus.echoObject["026301"]["e0"] = [0x43]; // 停止
        this.sendPropertyChanged(this.shutterEchoStatus, "026301", "e0");

        if (this.shutterStatus.position === 100) {
          this.shutterStatus.state = "opened";
          this.shutterEchoStatus.echoObject["026301"]["ea"] = [0x41]; //全開
          this.sendPropertyChanged(
            this.shutterEchoStatus,
            "026301",
            "ea"
          );
        } else if (this.shutterStatus.position === 0) {
          this.shutterStatus.state = "closed";
          this.shutterEchoStatus.echoObject["026301"]["ea"] = [0x42]; //全閉
          this.sendPropertyChanged(
            this.shutterEchoStatus,
            "026301",
            "ea"
          );
        } else {
          this.shutterStatus.state = "halfOpen";
          this.shutterEchoStatus.echoObject["026301"]["ea"] = [0x45]; //途中停止
          this.sendPropertyChanged(
            this.shutterEchoStatus,
            "026301",
            "ea"
          );
        }
      }
    }

    this.logger.dir(this.shutterStatus, { depth: 3 });
  };

  public setShutterStatusFromRestApi = (
    req: express.Request,
    res: express.Response
  ): void => {
    const move = req.body.move;
    this.setShutterStatus({
      move: move,
      position: this.shutterStatus.position,
      state: this.shutterStatus.state,
    });

    res.json(this.shutterStatus);
  };
  public setShutterStatusFromEchoNet = (
    echoObject: EchoObject,
    propertyCodeText: string,
    newValue: number[]
  ): boolean => {
    if (propertyCodeText === "e0") {
      const newStatus: ShutterStatus = {
        move: this.shutterStatus.move,
        position: this.shutterStatus.position,
        state: this.shutterStatus.state,
      };
      newStatus.move =
        newValue[0] === 0x41
          ? "opening"
          : newValue[0] === 0x42
          ? "closing"
          : "stopped";
      this.setShutterStatus(newStatus);
      return true;
    }
    return false;
  };

  private timer = (): void => {
    if (this.shutterStatus.move === "opening") {
      this.shutterStatus.position += 20;
      if (this.shutterStatus.position >= 100) {
        this.shutterStatus.position = 100;
        this.shutterStatus.state = "opened";
        this.shutterStatus.move = "stopped";
        this.shutterEchoStatus.echoObject["026301"]["e0"] = [0x43]; //停止
        this.shutterEchoStatus.echoObject["026301"]["ea"] = [0x41]; //全開
        this.sendPropertyChanged(this.shutterEchoStatus, "026301", "e0");
        this.sendPropertyChanged(this.shutterEchoStatus, "026301", "ea");
      }
      this.logger.dir(this.shutterStatus, { depth: 3 });
    }
    if (this.shutterStatus.move === "closing") {
      this.shutterStatus.position -= 20;
      if (this.shutterStatus.position <= 0) {
        this.shutterStatus.position = 0;
        this.shutterStatus.state = "closed";
        this.shutterStatus.move = "stopped";
        this.shutterEchoStatus.echoObject["026301"]["e0"] = [0x43]; //停止
        this.shutterEchoStatus.echoObject["026301"]["ea"] = [0x42]; //全閉
        this.sendPropertyChanged(this.shutterEchoStatus, "026301", "e0");
        this.sendPropertyChanged(this.shutterEchoStatus, "026301", "ea");
      }
      this.logger.dir(this.shutterStatus, { depth: 3 });
    }
    if (
      this.bathWaterHeaterStatus.auto === "on" &&
      this.bathWaterHeaterStatus.waterLevel < 100
    ) {
      this.bathWaterHeaterStatus.waterLevel += 20;
      if (this.bathWaterHeaterStatus.waterLevel >= 100) {
        this.bathWaterHeaterStatus.waterLevel = 100;
        this.bathWaterHeaterStatus.state = "full";
        this.bathWaterHeaterEchoStatus.echoObject["026b01"]["ea"] = [0x43]; //保温中=0x43
        this.sendPropertyChanged(
          this.bathWaterHeaterEchoStatus,
          "026b01",
          "ea"
        );
      }
      this.logger.dir(this.bathWaterHeaterStatus, { depth: 3 });
    }
    if (
      this.bathWaterHeaterStatus.auto === "off" &&
      this.bathWaterHeaterStatus.waterLevel > 0
    ) {
      this.bathWaterHeaterStatus.waterLevel -= 20;
      if (this.bathWaterHeaterStatus.waterLevel <= 0) {
        this.bathWaterHeaterStatus.waterLevel = 0;
        this.bathWaterHeaterStatus.state = "empty";
      }
      this.logger.dir(this.bathWaterHeaterStatus, { depth: 3 });
    }
  };

  doorStatus: DoorStatus = {
    state: "closed",
    lockState: "unlocked",
  };
  doorEchoStatus: EchoStatus = {
    enabled: true,
    eoj:"026f01",
    echoObject: {
      "026f01": {
        80: [0x30], //動作状態
        e0: [0x42], //施錠設定１  施錠＝0x41，解錠＝0x42
        e3: [0x42], //扉開閉状態	開＝0x41，閉＝0x42
        "9d": [0x02, 0x80, 0xe0], //状変アナウンスプロパティマップ
        "9e": [0x01, 0xe0], //Setプロパティマップ
      },
    }
  }
  switchEchoStatus: EchoStatus = {
    enabled: true,
    eoj: "05fd01",
    echoObject: {
      //スイッチクラス（JEM-A / HA 端子対応）
      "05fd01": {
        80: [0x30], //動作状態
        "9d": [0x01, 0x80], //状変アナウンスプロパティマップ
        "9e": [0x01, 0x80], //Setプロパティマップ
      },
    },
  };

  public getDoorStatus = (
    req: express.Request,
    res: express.Response
  ): void => {
    res.json(this.doorStatus);
  };

  public setDoorStatus = (newStatus: DoorStatus): void => {
    const state = newStatus.state;
    if (this.doorStatus.state !== state) {
      this.doorStatus.state = state;
      this.doorEchoStatus.echoObject["026f01"]["e3"] =
        state === "closed" ? [0x42] : [0x41];
      this.sendPropertyChanged(this.doorEchoStatus, "026f01", "e3");
    }
    const lockState = newStatus.lockState;
    if (this.doorStatus.lockState !== lockState) {
      this.doorStatus.lockState = lockState;
      this.doorEchoStatus.echoObject["026f01"]["e0"] =
        lockState === "unlocked" ? [0x42] : [0x41];
      this.sendPropertyChanged(this.doorEchoStatus, "026f01", "e0");
      this.switchEchoStatus.echoObject["05fd01"]["80"] =
        lockState === "unlocked" ? [0x30] : [0x31];
      this.sendPropertyChanged(this.switchEchoStatus, "05fd01", "80");
    }

    this.logger.dir(this.doorStatus, { depth: 3 });
  };
  public setDoorStatusFromRestApi = (
    req: express.Request,
    res: express.Response
  ): void => {
    const state = req.body.state === "closed" ? "closed" : "opened";
    const lockState = req.body.lockState === "unlocked" ? "unlocked" : "locked";

    this.setDoorStatus({
      lockState: lockState,
      state: state,
    });

    res.json(this.doorStatus);
  };
  public setDoorStatusFromEchoNet = (
    echoObject: EchoObject,
    propertyCodeText: string,
    newValue: number[]
  ): boolean => {
    if ("026f01" in echoObject) {
      if (propertyCodeText === "e0") {
        const newStatus: DoorStatus = {
          lockState: newValue[0] === 0x42 ? "unlocked" : "locked",
          state: this.doorStatus.state,
        };

        this.setDoorStatus(newStatus);
        return true;
      }
    }
    if ("05fd01" in echoObject) {
      if (propertyCodeText === "80") {
        const newStatus: DoorStatus = {
          lockState: newValue[0] === 0x30 ? "unlocked" : "locked",
          state: this.doorStatus.state,
        };

        this.setDoorStatus(newStatus);
        return true;
      }
    }
    return false;
  };

  bathWaterHeaterStatus: BathWaterHeaterStatus = {
    state: "empty",
    auto: "off",
    temp: 41,
    waterLevel: 0, // 0:空、100:Full
  };
  bathWaterHeaterEchoStatus : EchoStatus = {
    enabled: true,
    eoj:"026b01",
    echoObject: {
      "026b01": {
        80: [0x30], //   動作状態	0x80	0x30
        b0: [0x41], //   沸き上げ自動設定	0xB0	自動沸き上げ＝0x41
        b2: [0x40], //   沸き上げ中状態	0xB2	沸き上げ中＝0x41
        c0: [0x42], //   昼間沸き増し許可設定	0xC0	昼間沸き増し禁止＝0x42
        c3: [0x42], //   給湯中状態	0xC3	非給湯中=0x42	(湯はりは除く)
        e3: [0x42], //   風呂自動モード設定	0xE3	自動入＝0x41，自動解除＝0x42
        c7: [0x00], //   エネルギーシフト参加状態	0xC7	不参加	0x00
        c8: [0x14], //   沸き上げ開始基準時刻	0xC8	20 時 0x14
        c9: [0x01], //   エネルギーシフト回数	0xC9	1 回／2 回（0x01、0x02）
        ca: [0x00], //   昼間沸き上げシフト時刻１	0xCA	0x00：クリア状態
        cb: Array.from(new Array(32)).map((_) => 0x00), //   昼間沸き上げシフト時刻１での沸き上げ予測電力量	0xCB	0x00000000	0x00000000	0x00000000	0x00000000
        cc: Array.from(new Array(16)).map((_) => 0x00), //   時間当たり消費電力量 1	0xCC	0x0000
        cd: [0x00], //   昼間沸き上げシフト時刻 2	0xCD	0x00
        ce: Array.from(new Array(24)).map((_) => 0x00), //   昼間沸き上げシフト時刻２での沸き上げ予測電力量	0xCE	0x00000000	0x00000000	0x00000000	0x00000000
        cf: Array.from(new Array(12)).map((_) => 0x00), //   時間当たり消費電力量 2	0xCF	0x0000
        d3: [41], // 風呂温度設定値	0xD3	0x00～0x64 (0～100℃)
        ea: [0x42], //風呂動作状態監視	0xEA	湯張り中=0x41、保温中=0x43、停止中=0x42
        "9d": [0x05, 0x80, 0xb0, 0xb2, 0xc3, 0xea], //状変アナウンスプロパティマップ
        "9e": [0x02, 0xd3, 0xe3], //Setプロパティマップ
      },
    },
  };

  public getBathWaterHeaterStatus = (
    req: express.Request,
    res: express.Response
  ): void => {
    res.json(this.bathWaterHeaterStatus);
  };
  public setBathWaterHeaterStatus = (
    newStatus: BathWaterHeaterStatus
  ): void => {
    const auto = newStatus.auto;
    if (this.bathWaterHeaterStatus.auto !== auto) {
      this.bathWaterHeaterStatus.auto = auto;
      if (this.bathWaterHeaterStatus.auto === "on") {
        this.bathWaterHeaterEchoStatus.echoObject["026b01"]["e3"] = [0x41]; //自動入＝0x41
        this.sendPropertyChanged(
          this.bathWaterHeaterEchoStatus,
          "026b01",
          "e3"
        );

        if (this.bathWaterHeaterStatus.waterLevel < 100) {
          this.bathWaterHeaterStatus.state = "supply";
          this.bathWaterHeaterEchoStatus.echoObject["026b01"]["ea"] = [0x41]; //湯張り中=0x41
          this.sendPropertyChanged(
            this.bathWaterHeaterEchoStatus,
            "026b01",
            "ea"
          );
        } else if (this.bathWaterHeaterStatus.waterLevel === 100) {
          this.bathWaterHeaterStatus.state = "full";
          this.bathWaterHeaterEchoStatus.echoObject["026b01"]["ea"] = [0x43]; //保温中=0x43
          this.sendPropertyChanged(
            this.bathWaterHeaterEchoStatus,
            "026b01",
            "ea"
          );
        }
      } else {
        this.bathWaterHeaterEchoStatus.echoObject["026b01"]["e3"] = [0x42]; //自動解除＝0x42
        this.sendPropertyChanged(
          this.bathWaterHeaterEchoStatus,
          "026b01",
          "e3"
        );

        if (this.bathWaterHeaterStatus.waterLevel > 0) {
          this.bathWaterHeaterStatus.state = "drainage";
          this.bathWaterHeaterEchoStatus.echoObject["026b01"]["ea"] = [0x42]; //停止中=0x42
          this.sendPropertyChanged(
            this.bathWaterHeaterEchoStatus,
            "026b01",
            "ea"
          );
        } else if (this.bathWaterHeaterStatus.waterLevel === 0) {
          this.bathWaterHeaterStatus.state = "empty";
          this.bathWaterHeaterEchoStatus.echoObject["026b01"]["ea"] = [0x42]; //停止中=0x42
          this.sendPropertyChanged(
            this.bathWaterHeaterEchoStatus,
            "026b01",
            "ea"
          );
        }
      }
    }
    if (30 <= newStatus.temp && newStatus.temp <= 60) {
      const temp = newStatus.temp;
      if (this.bathWaterHeaterStatus.temp !== temp) {
        this.bathWaterHeaterStatus.temp = temp;
        this.bathWaterHeaterEchoStatus.echoObject["026b01"]["d3"] = [temp];
        this.sendPropertyChanged(
          this.bathWaterHeaterEchoStatus,
          "026b01",
          "d3"
        );
      }
    }

    this.logger.dir(this.bathWaterHeaterStatus, { depth: 3 });
  };
  public setBathWaterHeaterStatusFromRestApi = (
    req: express.Request,
    res: express.Response
  ): void => {
    const newStatus: BathWaterHeaterStatus = {
      auto: this.bathWaterHeaterStatus.auto,
      state: this.bathWaterHeaterStatus.state,
      temp: this.bathWaterHeaterStatus.temp,
      waterLevel: this.bathWaterHeaterStatus.waterLevel,
    };
    newStatus.auto = req.body.auto === "on" ? "on" : "off";

    if (30 <= req.body.temp && req.body.temp <= 60) {
      newStatus.temp = req.body.temp;
    }

    this.setBathWaterHeaterStatus(newStatus);
    res.json(this.bathWaterHeaterStatus);
  };

  public setBathWaterHeaterStatusFromEchoNet = (
    echoObject: EchoObject,
    propertyCodeText: string,
    newValue: number[]
  ): boolean => {
    const newStatus: BathWaterHeaterStatus = {
      auto: this.bathWaterHeaterStatus.auto,
      state: this.bathWaterHeaterStatus.state,
      temp: this.bathWaterHeaterStatus.temp,
      waterLevel: this.bathWaterHeaterStatus.waterLevel,
    };
    if (propertyCodeText === "d3") {
      let newTemp = newValue[0];
      if (newTemp < 30) {
        newTemp = 30;
      }
      if (newTemp > 60) {
        newTemp = 60;
      }
      newStatus.temp = newTemp;
      this.setBathWaterHeaterStatus(newStatus);
      return true;
    } else if (propertyCodeText === "e3") {
      //   風呂自動モード設定	0xE3	自動入＝0x41，自動解除＝0x42
      newStatus.auto = newValue[0] === 0x41 ? "on" : "off";
      this.setBathWaterHeaterStatus(newStatus);
      return true;
    }
    return false;
  };

  airConditionerStatus: AirConditionerStatus = {
    state: "off",
    internalMode: "cool",
    temp: 22
  };
  airConditionerEchoStatus: EchoStatus = {
    enabled: true,
    eoj:"013001",
    echoObject: {
      "013001": {
        80: [0x30], //   動作状態	0x80	ＯＮ＝0x30，ＯＦＦ＝0x31
        "8f": [0x42], //節電動作設定  0x8F    節電動作中=0x41      通常動作中=0x42
        b0: [0x42], // 運転モード設定 0xB0 自動／冷房／暖房／除湿／送風／その他	0x41/0x42/0x43/0x44/0x45/0x40
        b3: [22], // 温度設定値	0xB3	0x00～0x32（0～50℃）
        bb: [20], // 室内温度計測値	0xBB	0x81～0x7D (－127～125℃）
        a0: [0x41], // 風量設定	0xA0	風量自動設定＝0x41	風量レベル＝0x31～0x38
        "9d": [0x05, 0x80, 0x8f, 0xb0, 0xb3, 0xa0], //状変アナウンスプロパティマップ
        "9e": [0x03, 0x80, 0xb0, 0xb3], //Setプロパティマップ
      },
    },
  };

  public getAirConditionerStatus = (
    req: express.Request,
    res: express.Response
  ): void => {
    res.json(this.airConditionerStatus);
  };
  public setAirConditionerStatus = (status: AirConditionerStatus): void => {
    const newState = status.state;
    const newInternalMode = status.internalMode;
    if (
      newState !== "off" &&
      newState !== "cool" &&
      newState !== "heat" &&
      newState !== "dry" &&
      newState !== "wind"
    ) {
      return;
    }
    if (
      newInternalMode !== "cool" &&
      newInternalMode !== "heat" &&
      newInternalMode !== "dry" &&
      newInternalMode !== "wind"
    ) {
      return;
    }

    if (this.airConditionerStatus.state !== newState) {
      this.airConditionerStatus.state = newState;
      this.airConditionerEchoStatus.echoObject["013001"]["80"] =
        this.airConditionerStatus.state !== "off" ? [0x30] : [0x31];
      this.sendPropertyChanged(
        this.airConditionerEchoStatus,
        "013001",
        "80"
      );
    }

    if (this.airConditionerStatus.internalMode !== newInternalMode) {
      this.airConditionerStatus.internalMode = status.internalMode;

      if (this.airConditionerStatus.internalMode === "cool") {
        this.airConditionerEchoStatus.echoObject["013001"]["b0"] = [0x42];
        this.sendPropertyChanged(
          this.airConditionerEchoStatus,
          "013001",
          "b0"
        );
      }
      if (this.airConditionerStatus.internalMode === "heat") {
        this.airConditionerEchoStatus.echoObject["013001"]["b0"] = [0x43];
        this.sendPropertyChanged(
          this.airConditionerEchoStatus,
          "013001",
          "b0"
        );
      }
      if (this.airConditionerStatus.internalMode === "dry") {
        this.airConditionerEchoStatus.echoObject["013001"]["b0"] = [0x44];
        this.sendPropertyChanged(
          this.airConditionerEchoStatus,
          "013001",
          "b0"
        );
      }
      if (this.airConditionerStatus.internalMode === "wind") {
        this.airConditionerEchoStatus.echoObject["013001"]["b0"] = [0x45];
        this.sendPropertyChanged(
          this.airConditionerEchoStatus,
          "013001",
          "b0"
        );
      }
    }

    let temp = status.temp;
    if (typeof temp === "string") {
      temp = parseInt(temp);
      if (isNaN(temp)) {
        temp = this.airConditionerStatus.temp;
      }
    }

    if (typeof temp === "number" && 18 <= temp && temp <= 30) {
      if (this.airConditionerStatus.temp !== temp) {
        this.airConditionerStatus.temp = temp;

        this.airConditionerEchoStatus.echoObject["013001"]["b3"] = [temp];
        this.sendPropertyChanged(
          this.airConditionerEchoStatus,
          "013001",
          "b3"
        );
      }
    }

    this.logger.dir(this.airConditionerStatus, { depth: 3 });
  };

  public setAirConditionerStatusFromRestApi = (
    req: express.Request,
    res: express.Response
  ): void => {
    this.setAirConditionerStatus({
      state: req.body.state,
      temp: req.body.temp,
      internalMode:
        req.body.state !== "off"
          ? req.body.state
          : this.airConditionerStatus.internalMode,
    });
    res.json(this.airConditionerStatus);
  };

  public setAirConditionerStatusFromEchoNet = (
    echoObject: EchoObject,
    propertyCodeText: string,
    newValue: number[]
  ): boolean => {
    const newStatus = {
      state: this.airConditionerStatus.state,
      temp: this.airConditionerStatus.temp,
      internalMode: this.airConditionerStatus.internalMode,
    };
    if (propertyCodeText === "80") {
      newStatus.state = newValue[0] === 0x30 ? newStatus.internalMode : "off";
      this.setAirConditionerStatus(newStatus);
      return true;
    } else if (propertyCodeText === "b0") {
      newStatus.internalMode =
        newValue[0] === 0x42
          ? "cool"
          : newValue[0] === 0x43
          ? "heat"
          : newValue[0] === 0x44
          ? "dry"
          : newValue[0] === 0x45
          ? "wind"
          : newStatus.internalMode;
      if (newStatus.state !== "off") {
        newStatus.state = newStatus.internalMode;
      }
      this.setAirConditionerStatus(newStatus);
      return true;
    } else if (propertyCodeText === "b3") {
      let newTemp = newValue[0];
      if (newTemp < 18) {
        newTemp = 18;
      }
      if (newTemp > 30) {
        newTemp = 30;
      }
      newStatus.temp = newTemp;
      this.setAirConditionerStatus(newStatus);
      return true;
    }
    return false;
  };

  public getStatus = (req: express.Request, res: express.Response): void => {
    const result = {
      light: this.cellingLightStatus,
      sensorMeter: this.sensorMeterStatus,
      motionSensor: this.motionSensorStatus,
      floorLight: this.floorLightStatus,
      shutter: this.shutterStatus,
      door: this.doorStatus,
      bath: this.bathWaterHeaterStatus,
      airConditioner: this.airConditionerStatus,
    };
    res.json(result);
  };

  private setCommonProperties = (echoObject: EchoObject, id:string=""): void => {
    for (const key in echoObject) {
      echoObject[key]["81"] = [0x00]; //設置場所
      echoObject[key]["82"] = [0x00, 0x00, 0x50, 0x01]; //規格 Version 情報
      echoObject[key]["88"] = [0x42]; //異常発生状態
      echoObject[key]["8a"] = [0xff, 0xff, 0xff]; //メーカーコード
      
      if(id !== "")
      {
        echoObject[key]["83"] = EL.toHexArray(id);
      }

      const getProperties = [0x00];
      for (const propertyNo in echoObject[key]) {
        if (propertyNo.match(/[0-9A-Fa-f]{2}/) !== null) {
          getProperties.push(parseInt(propertyNo, 16));
        }
      }
      getProperties.push(0x9f); //Getプロパティマップ

      getProperties[0] = getProperties.length - 1;
      if (getProperties.length <= 16) {
        echoObject[key]["9f"] = getProperties;
      } else {
        const getPropertiesPart2 = new Array(17);
        getPropertiesPart2.fill(0x00);
        getPropertiesPart2[0] = getProperties.length - 1;
        for (let i = 1; i < getProperties.length; i++) {
          const propCode = getProperties[i];
          const index = (propCode % 0x10) + 1;
          const bit = (propCode >> 4) - 8;

          getPropertiesPart2[index] = getPropertiesPart2[index] | (0x01 << bit);
        }
        echoObject[key]["9f"] = getPropertiesPart2;
      }
    }
  };

  allStatusList: EchoStatus[];

  public setValueFromEchoNet = (
    echoObject: EchoObject,
    propertyCodeText: string,
    newValue: number[]
  ): boolean => {
    for (const eoj in echoObject) {
      const echoObjectObj = echoObject[eoj];

      const propertyCode = EL.toHexArray(propertyCodeText)[0];
      if (
        echoObjectObj["9e"].filter((_): boolean => _ === propertyCode)
          .length === 0
      ) {
        // 変更不許可
        continue;
      }

      if ("029101" in echoObject) {
        return this.setCellingLightStatusFromEchoNet(
          echoObject,
          propertyCodeText,
          newValue
        );
      }
      if ("029001" in echoObject) {
        return this.setFloorLightStatusFromEchoNet(
          echoObject,
          propertyCodeText,
          newValue
        );
      }
      if ("026301" in echoObject) {
        return this.setShutterStatusFromEchoNet(
          echoObject,
          propertyCodeText,
          newValue
        );
      }
      if ("026f01" in echoObject) {
        return this.setDoorStatusFromEchoNet(
          echoObject,
          propertyCodeText,
          newValue
        );
      }
      if ("05fd01" in echoObject) {
        return this.setDoorStatusFromEchoNet(
          echoObject,
          propertyCodeText,
          newValue
        );
      }
      if ("026b01" in echoObject) {
        return this.setBathWaterHeaterStatusFromEchoNet(
          echoObject,
          propertyCodeText,
          newValue
        );
      }
      if ("013001" in echoObject) {
        return this.setAirConditionerStatusFromEchoNet(
          echoObject,
          propertyCodeText,
          newValue
        );
      }
    }
    return false;
  };

  public sendCommandCallback = (command: string): void => {
    //ignore
  };

  public postCommandsFromRestApi = (
    req: express.Request,
    res: express.Response
  ): void => {
    // urlの中の:commandを取得
    const command = req.params.command;
    if (command === "instanceListNotification") {
      this.sendCommandCallback("instanceListNotification");
      res.json({ result: "ok" });
      return;
    }
    res.status(400).send("Invalid Command");
  };
}
