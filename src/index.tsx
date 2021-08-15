import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import {
  airConditionerStatus,
  allStatus,
  api,
  AppStore,
  bathStatus,
  doorStatus,
  floorLightStatus,
  lightStatus,
  motionSensorStatus,
  sensorMeterStatus,
  shutterStatus,
} from "./AppStore";
import { Provider } from "mobx-react";

class localApi implements api {
  all = allStatus.empty;

  getStatus = async (): Promise<allStatus> => {
    return this.all;
  };

  setLight = async (light: lightStatus): Promise<lightStatus> => {
    this.all.light = light;
    return this.all.light;
  };
  setSensorMeter = async (
    sensorMeter: sensorMeterStatus
  ): Promise<sensorMeterStatus> => {
    this.all.sensorMeter = sensorMeter;
    return this.all.sensorMeter;
  };
  setMotionSensor = async (
    motionSensor: motionSensorStatus
  ): Promise<motionSensorStatus> => {
    this.all.motionSensor = motionSensor;
    return this.all.motionSensor;
  };
  setFloorLight = async (
    floorLight: floorLightStatus
  ): Promise<floorLightStatus> => {
    this.all.floorLight = floorLight;
    return this.all.floorLight;
  };
  setShutter = async (shutter: shutterStatus): Promise<shutterStatus> => {
    this.all.shutter = shutter;
    return this.all.shutter;
  };
  setDoor = async (door: doorStatus): Promise<doorStatus> => {
    this.all.door = door;
    return this.all.door;
  };
  setBath = async (bath: bathStatus): Promise<bathStatus> => {
    this.all.bath = bath;
    return this.all.bath;
  };
  setAirConditioner = async (
    airConditioner: airConditionerStatus
  ): Promise<airConditionerStatus> => {
    this.all.airConditioner = airConditioner;
    return this.all.airConditioner;
  };
}

class RestApi implements api {
  all = allStatus.empty;

  getStatus = async (): Promise<allStatus> => {
    const res = await fetch("/api/status");
    const result = await res.json();
    this.all = result;
    return result;
  };

  setLight = async (light: lightStatus): Promise<lightStatus> => {
    const body = JSON.stringify(light);
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    const res = await fetch(`/api/cellingLight`, {
      method: "POST",
      headers,
      body,
    });
    this.all.light = (await res.json()) as lightStatus;
    return this.all.light;
  };
  setSensorMeter = async (
    sensorMeter: sensorMeterStatus
  ): Promise<sensorMeterStatus> => {
    const body = JSON.stringify(sensorMeter);
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    const res = await fetch(`/api/sensorMeter`, {
      method: "POST",
      headers,
      body,
    });
    this.all.sensorMeter = (await res.json()) as sensorMeterStatus;
    return this.all.sensorMeter;
  };
  setMotionSensor = async (
    motionSensor: motionSensorStatus
  ): Promise<motionSensorStatus> => {
    const body = JSON.stringify(motionSensor);
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    const res = await fetch(`/api/motionSensor`, {
      method: "POST",
      headers,
      body,
    });
    this.all.motionSensor = (await res.json()) as motionSensorStatus;
    return this.all.motionSensor;
  };
  setFloorLight = async (
    floorLight: floorLightStatus
  ): Promise<floorLightStatus> => {
    const body = JSON.stringify(floorLight);
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    const res = await fetch(`/api/floorLight`, {
      method: "POST",
      headers,
      body,
    });
    this.all.floorLight = (await res.json()) as floorLightStatus;
    return this.all.floorLight;
  };
  setShutter = async (shutter: shutterStatus): Promise<shutterStatus> => {
    const body = JSON.stringify(shutter);
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    const res = await fetch(`/api/shutter`, {
      method: "POST",
      headers,
      body,
    });
    this.all.shutter = (await res.json()) as shutterStatus;
    return this.all.shutter;
  };
  setDoor = async (door: doorStatus): Promise<doorStatus> => {
    const body = JSON.stringify(door);
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    const res = await fetch(`/api/door`, {
      method: "POST",
      headers,
      body,
    });
    this.all.door = (await res.json()) as doorStatus;
    return this.all.door;
  };
  setBath = async (bath: bathStatus): Promise<bathStatus> => {
    const body = JSON.stringify(bath);
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    const res = await fetch(`/api/bathWaterHeater`, {
      method: "POST",
      headers,
      body,
    });
    this.all.bath = (await res.json()) as bathStatus;
    return this.all.bath;
  };
  setAirConditioner = async (
    airConditioner: airConditionerStatus
  ): Promise<airConditionerStatus> => {
    const body = JSON.stringify(airConditioner);
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    const res = await fetch(`/api/airConditioner`, {
      method: "POST",
      headers,
      body,
    });
    this.all.airConditioner = (await res.json()) as airConditionerStatus;
    return this.all.airConditioner;
  };
}

const stores = {
  app: new AppStore(new RestApi()),
};

ReactDOM.render(
  <React.StrictMode>
    <Provider {...stores}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
