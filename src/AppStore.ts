import { action, makeAutoObservable, observable } from "mobx";

export interface lightStatus {
  state: "on" | "off";
}
export class lightStatus {
  static empty: lightStatus = {
    state: "off",
  };
}

export interface sensorMeterStatus {
  temp: number;
  hum: number;
}
export class sensorMeterStatus {
  static empty: sensorMeterStatus = {
    temp: 20,
    hum: 50,
  };
}
export interface motionSensorStatus {
  state: "detected" | "notDetected";
}
export class motionSensorStatus {
  static empty: motionSensorStatus = {
    state: "detected",
  };
}

export interface floorLightStatus {
  state: "on" | "off";
  color: "電球色" | "白色" | "昼白色";
}
export class floorLightStatus {
  static empty: floorLightStatus = {
    state: "on",
    color: "電球色",
  };
}
export interface shutterStatus {
  state: "opened" | "opening" | "halfOpen" | "closing" | "closed";
  move: "opening" | "closing" | "stopped";
}
export class shutterStatus {
  static empty: shutterStatus = {
    state: "opened",
    move: "stopped",
  };
}
export interface doorStatus {
  state: "opened" | "closed";
  lockState: "locked" | "unlocked";
}
export class doorStatus {
  static empty: doorStatus = {
    state: "closed",
    lockState: "unlocked",
  };
}
export interface bathStatus {
  state: "empty" | "drainage" | "supply" | "full";
  auto: "on" | "off";
  temp: number;
}
export class bathStatus {
  static empty: bathStatus = {
    state: "full",
    auto: "off",
    temp: 42,
  };
}
export interface airConditionerStatus {
  state: "off" | "cool" | "heat" | "dry" | "wind";
  temp: number;
}
export class airConditionerStatus {
  static empty: airConditionerStatus = {
    state: "off",
    temp: 22,
  };
}

export interface allStatus {
  light: lightStatus;
  sensorMeter: sensorMeterStatus;
  motionSensor: motionSensorStatus;
  floorLight: floorLightStatus;
  shutter: shutterStatus;
  door: doorStatus;
  bath: bathStatus;
  airConditioner: airConditionerStatus;
}

export class allStatus {
  static empty: allStatus = {
    light: lightStatus.empty,
    sensorMeter: sensorMeterStatus.empty,
    motionSensor: motionSensorStatus.empty,
    floorLight: floorLightStatus.empty,
    shutter: shutterStatus.empty,
    door: doorStatus.empty,
    bath: bathStatus.empty,
    airConditioner: airConditionerStatus.empty,
  };
}

export interface api {
  getStatus(): Promise<allStatus>;
  setLight(light: lightStatus): Promise<lightStatus>;
  setSensorMeter(sensorMeter: sensorMeterStatus): Promise<sensorMeterStatus>;
  setMotionSensor(
    motionSensor: motionSensorStatus
  ): Promise<motionSensorStatus>;
  setFloorLight(floorLight: floorLightStatus): Promise<floorLightStatus>;
  setShutter(shutter: shutterStatus): Promise<shutterStatus>;
  setDoor(doorStatus: doorStatus): Promise<doorStatus>;
  setBath(bath: bathStatus): Promise<bathStatus>;
  setAirConditioner(
    airConditioner: airConditionerStatus
  ): Promise<airConditionerStatus>;
}

export class AppStore {
  @observable
  light = lightStatus.empty;
  @observable
  sensorMeter = sensorMeterStatus.empty;
  @observable
  motionSensor = motionSensorStatus.empty;
  @observable
  floorLight = floorLightStatus.empty;
  @observable
  shutter = shutterStatus.empty;
  @observable
  door = doorStatus.empty;
  @observable
  bath = bathStatus.empty;
  @observable
  airConditioner = airConditionerStatus.empty;

  sensorTempChanged = false;
  sensorHumChanged = false;
  airConditionerTempChanged = false;
  bathTempChanged = false;
  private api: api;

  public constructor(api: api) {
    this.api = api;
    setInterval(this.timer, 1000);
    makeAutoObservable(this);
  }

  private timer = async (): Promise<void> => {
    if (this.sensorTempChanged || this.sensorHumChanged) {
      this.api.setSensorMeter(this.sensorMeter);
      this.sensorTempChanged = false;
      this.sensorHumChanged = false;
    }
    if (this.airConditionerTempChanged) {
      this.api.setAirConditioner(this.airConditioner);
      this.airConditionerTempChanged = false;
    }
    if (this.bathTempChanged) {
      this.api.setBath(this.bath);
      this.bathTempChanged = false;
    }
    const all = await this.api.getStatus();
    this.light = all.light;
    this.motionSensor = all.motionSensor;
    this.floorLight = all.floorLight;
    this.shutter = all.shutter;
    this.door = all.door;
    this.sensorMeter = all.sensorMeter;
    this.airConditioner = all.airConditioner;
    this.bath = all.bath;
  };

  @action
  public changeMetorSensorTemp = (
    event: React.ChangeEvent<unknown>,
    value: number | number[]
  ): void => {
    if (typeof value !== "number") {
      return;
    }
    this.sensorMeter = {
      temp: value,
      hum: this.sensorMeter.hum,
    };
    this.sensorTempChanged = true;
  };
  @action
  public changeMetorSensorHum = (
    event: React.ChangeEvent<unknown>,
    value: number | number[]
  ): void => {
    if (typeof value !== "number") {
      return;
    }
    this.sensorMeter = {
      temp: this.sensorMeter.temp,
      hum: value,
    };
    this.sensorHumChanged = true;
  };
  @action
  public toggleLock = async (): Promise<void> => {
    this.door = await this.api.setDoor({
      lockState: this.door.lockState === "locked" ? "unlocked" : "locked",
      state: this.door.state,
    });
  };
  @action
  public toggleDoorState = async (): Promise<void> => {
    this.door = await this.api.setDoor({
      lockState: this.door.lockState,
      state: this.door.state === "opened" ? "closed" : "opened",
    });
  };
  @action
  public toggleLight = async (): Promise<void> => {
    this.light = await this.api.setLight({
      state: this.light.state === "on" ? "off" : "on",
    });
  };
  @action
  public toggleMotion = async (): Promise<void> => {
    this.motionSensor = await this.api.setMotionSensor({
      state:
        this.motionSensor.state === "detected" ? "notDetected" : "detected",
    });
  };
  @action
  public toggleFloorLight = async (): Promise<void> => {
    this.floorLight = await this.api.setFloorLight({
      state: this.floorLight.state === "on" ? "off" : "on",
      color: this.floorLight.color,
    });
  };
  @action
  public setAirConditionerMode = (
    mode: "off" | "cool" | "heat" | "dry" | "wind"
  ): (() => Promise<void>) => {
    return async (): Promise<void> => {
      this.airConditioner = await this.api.setAirConditioner({
        state: mode,
        temp: this.airConditioner.temp,
      });
    };
  };
  @action
  public changeAirConditionerTemp = async (
    event: React.ChangeEvent<unknown>,
    value: number | number[]
  ): Promise<void> => {
    if (typeof value !== "number") {
      return;
    }
    this.airConditioner.temp = value;
    this.airConditionerTempChanged = true;
  };
  @action
  public toggleBathAuto = async (): Promise<void> => {
    this.bath = await this.api.setBath({
      auto: this.bath.auto === "on" ? "off" : "on",
      state: this.bath.state,
      temp: this.bath.temp,
    });
  };
  @action
  public incrementBathTemp = (): void => {
    this.bath = {
      auto: this.bath.auto,
      state: this.bath.state,
      temp: this.bath.temp < 60 ? this.bath.temp + 1 : 60,
    };
    this.bathTempChanged = true;
  };
  @action
  public decrementBathTemp = (): void => {
    this.bath = {
      auto: this.bath.auto,
      state: this.bath.state,
      temp: this.bath.temp > 30 ? this.bath.temp - 1 : 30,
    };
    this.bathTempChanged = true;
  };
  @action
  public upShutter = async (): Promise<void> => {
    this.shutter = await this.api.setShutter({
      state: "opening",
      move: "opening",
    });
  };
  @action
  public downShutter = async (): Promise<void> => {
    this.shutter = await this.api.setShutter({
      state: "closing",
      move: "closing",
    });
  };
  @action
  public stopShutter = async (): Promise<void> => {
    this.shutter = await this.api.setShutter({
      state: "halfOpen",
      move: "stopped",
    });
  };
}
