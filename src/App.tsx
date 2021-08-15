import { Button, Slider } from "@material-ui/core";
import {
  Stop,
  VerticalAlignBottom,
  VerticalAlignTop,
} from "@material-ui/icons";
import { inject, observer } from "mobx-react";
import React from "react";
import "./App.css";
import {
  airConditionerStatus,
  AppStore,
  bathStatus,
  doorStatus,
  floorLightStatus,
  lightStatus,
  sensorMeterStatus,
  shutterStatus,
} from "./AppStore";

interface AppProps {
  app?: AppStore;
}

@inject("app")
@observer
class App extends React.Component<AppProps> {
  render(): JSX.Element {
    if (this.props.app === undefined) {
      return <div />;
    }
    const store = this.props.app;
    return (
      <div className="App">
        <div>
          <svg width="1200px" height="800px">
            <image
              x="400"
              y="170"
              width="280"
              height="280"
              xlinkHref="./outside.png"
            ></image>
            {this.getShutterImage(store.shutter)}
            <image
              x="350"
              y="150"
              width="400"
              height="330"
              xlinkHref="./window.png"
            ></image>
            <image
              x="100"
              y="100"
              width="800"
              height="681"
              xlinkHref="./bgimage.png"
            ></image>
            {store.motionSensor.state === "detected" ? (
              <image
                x="100"
                y="100"
                width="800"
                height="681"
                xlinkHref="./human.png"
              ></image>
            ) : (
              <React.Fragment />
            )}
            <image
              x="100"
              y="100"
              width="800"
              height="681"
              xlinkHref="./desk.png"
            ></image>
            <image
              x="30"
              y="100"
              width="260"
              height="128"
              xlinkHref="./airconditioner.png"
            ></image>
            <image
              x="-50"
              y="400"
              width="291"
              height="400"
              xlinkHref="./standlight.png"
            ></image>
            <image
              x="300"
              y="0"
              width="426"
              height="95"
              xlinkHref="./cellinglight.png"
            ></image>

            {this.getTempSensorImage(store.sensorMeter)}
            {this.getDoorImage(store.door)}

            {this.getBathImage(store.bath)}
            {this.getCellingLightImage(store.light)}
            {this.getFloorLightImage(store.floorLight)}

            {this.getAirConditionerImage(store.airConditioner)}
            <rect
              x="990"
              y="690"
              width="210"
              height="80"
              fill="#FFFFFF"
              style={{
                stroke: "#000000",
                strokeWidth: 1,
              }}
            />
          </svg>
        </div>
        <div>
          <Button
            variant="outlined"
            onClick={store.upShutter}
            style={{ position: "absolute", left: "730px", top: "300px" }}
          >
            <VerticalAlignTop />
          </Button>
          <Button
            variant="outlined"
            onClick={store.stopShutter}
            style={{ position: "absolute", left: "730px", top: "340px" }}
          >
            <Stop />
          </Button>
          <Button
            variant="outlined"
            onClick={store.downShutter}
            style={{ position: "absolute", left: "730px", top: "380px" }}
          >
            <VerticalAlignBottom />
          </Button>
          <Button
            id="button-bath-auto"
            onClick={store.toggleBathAuto}
            variant="contained"
            color={store.bath.auto === "on" ? "primary" : "inherit"}
            style={{
              position: "absolute",
              left: "1000px",
              top: "700px",
              width: "60px",
              height: "60px",
            }}
          >
            BATH
            <br />
            AUTO
          </Button>
          <p
            id="label-bath-temp"
            style={{
              position: "absolute",
              left: "1070px",
              top: "700px",
              width: "60px",
              height: "60px",
            }}
          >
            {store.bath.temp}℃
          </p>
          <Button
            id="button-bath-temp-up"
            onClick={store.incrementBathTemp}
            variant="contained"
            style={{
              position: "absolute",
              left: "1120px",
              top: "700px",
              width: "60px",
              height: "28px",
            }}
          >
            ↑
          </Button>
          <Button
            id="button-bath-temp-down"
            onClick={store.decrementBathTemp}
            variant="contained"
            style={{
              position: "absolute",
              left: "1120px",
              top: "732px",
              width: "60px",
              height: "28px",
            }}
          >
            ↓
          </Button>
          <Button
            id="button-ceiling-light"
            onClick={store.toggleLight}
            style={{
              position: "absolute",
              left: "1100px",
              top: "250px",
              width: "100px",
              height: "150px",
            }}
          ></Button>
          <Button
            id="button-door-lock"
            onClick={store.toggleLock}
            style={{
              position: "absolute",
              left: "950px",
              top: "250px",
              width: "112px",
              height: "125px",
            }}
          ></Button>
          <Button
            id="button-door-opened"
            onClick={store.toggleDoorState}
            style={{
              position: "absolute",
              left: "900px",
              top: "380px",
              width: "190px",
              height: "155px",
            }}
          ></Button>
          <Button
            id="button-floor-light"
            onClick={store.toggleFloorLight}
            style={{
              position: "absolute",
              left: "45px",
              top: "410px",
              width: "100px",
              height: "100px",
            }}
          ></Button>
          <Button
            id="button-human"
            onClick={store.toggleMotion}
            style={{
              position: "absolute",
              left: "340px",
              top: "280px",
              width: "150px",
              height: "270px",
            }}
          ></Button>
          <p
            id="label-temp"
            style={{
              position: "absolute",
              left: "910px",
              top: "135px",
            }}
          >
            {store.sensorMeter.temp.toFixed(1)}℃
          </p>
          <Slider
            id="slider-temp"
            value={store.sensorMeter.temp}
            onChange={store.changeMetorSensorTemp}
            min={-10}
            max={40}
            step={0.1}
            color="secondary"
            style={{
              position: "absolute",
              left: "960px",
              top: "150px",
              width: "100px",
            }}
          />
          <p
            id="label-hum"
            style={{
              position: "absolute",
              left: "910px",
              top: "165px",
            }}
          >
            {store.sensorMeter.hum}%
          </p>
          <Slider
            id="slider-hum"
            value={store.sensorMeter.hum}
            onChange={store.changeMetorSensorHum}
            min={0}
            max={100}
            step={1}
            style={{
              position: "absolute",
              left: "960px",
              top: "180px",
              width: "100px",
            }}
          />
          <Slider
            id="slider-ha-temp"
            value={store.airConditioner.temp}
            onChange={store.changeAirConditionerTemp}
            min={18}
            max={30}
            step={0.5}
            valueLabelDisplay="auto"
            style={{
              position: "absolute",
              left: "70px",
              top: "110px",
              width: "150px",
            }}
          />
          <p
            id="label-ha-temp"
            style={{
              position: "absolute",
              left: "230px",
              top: "95px",
            }}
          >
            {store.airConditioner.temp.toFixed(1)}℃
          </p>
          <Button
            id="button-ha-off"
            onClick={store.setAirConditionerMode("off")}
            variant="outlined"
            style={{
              position: "absolute",
              left: "70px",
              top: "140px",
              width: "60px",
              height: "24px",
              fontWeight: "bolder",
            }}
          >
            OFF
          </Button>
          <Button
            id="button-ha-cool"
            onClick={store.setAirConditionerMode("cool")}
            variant="outlined"
            style={{
              position: "absolute",
              left: "140px",
              top: "140px",
              width: "60px",
              height: "24px",
              fontWeight: "bolder",
              color: "#0000FF",
            }}
          >
            COOL
          </Button>
          <Button
            id="button-ha-heat"
            onClick={store.setAirConditionerMode("heat")}
            variant="outlined"
            color="primary"
            style={{
              position: "absolute",
              left: "200px",
              top: "140px",
              width: "60px",
              height: "24px",
              fontWeight: "bolder",
              color: "#FF0000",
            }}
          >
            HEAT
          </Button>
          <Button
            id="button-ha-dry"
            onClick={store.setAirConditionerMode("dry")}
            variant="outlined"
            color="primary"
            style={{
              position: "absolute",
              left: "70px",
              top: "170px",
              width: "60px",
              height: "24px",
              fontWeight: "bolder",
              color: "#00C000",
            }}
          >
            DRY
          </Button>
          <Button
            id="button-ha-wind"
            onClick={store.setAirConditionerMode("wind")}
            variant="outlined"
            style={{
              position: "absolute",
              left: "140px",
              top: "170px",
              width: "60px",
              height: "24px",
              fontWeight: "bolder",
              color: "#00A0A0",
            }}
          >
            WIND
          </Button>
        </div>
      </div>
    );
  }
  getCellingLightImage = (light: lightStatus): JSX.Element[] => {
    if (light.state === "off") {
      return [
        <image
          x="1100"
          y="250"
          width="105"
          height="147"
          xlinkHref="./switch_off.png"
        ></image>,
      ];
    }
    return [
      <image
        x="1100"
        y="250"
        width="105"
        height="147"
        xlinkHref="./switch.png"
      ></image>,
      <line
        x1="419"
        y1="118"
        x2="406"
        y2="143"
        style={{
          stroke: "#fbcb00",
          strokeWidth: 12,
          strokeLinecap: "round",
        }}
      />,
      <line
        x1="469"
        y1="118"
        x2="463"
        y2="141"
        style={{
          stroke: "#fbcb00",
          strokeWidth: 12,
          strokeLinecap: "round",
        }}
      />,
      <line
        x1="521"
        y1="118"
        x2="527"
        y2="141"
        style={{
          stroke: "#fbcb00",
          strokeWidth: 12,
          strokeLinecap: "round",
        }}
      />,
      <line
        x1="571"
        y1="118"
        x2="580"
        y2="141"
        style={{
          stroke: "#fbcb00",
          strokeWidth: 12,
          strokeLinecap: "round",
        }}
      />,
    ];
  };

  getTempSensorImage = (sensorMeter: sensorMeterStatus): JSX.Element[] => {
    const tempDeg =
      (1 - (sensorMeter.temp - -10) / (40 - -10)) * (200 - -20) + -20;
    const tempX = Math.cos((Math.PI * tempDeg) / 180);
    const tempY = Math.sin((Math.PI * tempDeg) / 180);

    const humDeg = (1 - (sensorMeter.hum - 0) / (100 - 0)) * (200 - -20) + -20;
    const humX = Math.cos((Math.PI * humDeg) / 180);
    const humY = Math.sin((Math.PI * humDeg) / 180);

    return [
      <image
        x="800"
        y="120"
        width="104"
        height="104"
        xlinkHref="./sensor.png"
      ></image>,
      <line
        x1={852 + tempX * 30}
        y1={169 + tempY * -30}
        x2={852 - tempX * 5}
        y2={169 - tempY * -5}
        style={{
          stroke: "#ff0000",
          strokeWidth: 3,
          strokeLinecap: "round",
        }}
      />,
      <line
        x1={852 + humX * 15}
        y1={200 + humY * -15}
        x2={852 + humX * 2}
        y2={200 - humY * -2}
        style={{
          stroke: "#0000ff",
          strokeWidth: 3,
          strokeLinecap: "round",
        }}
      />,
    ];
  };

  getDoorImage = (doorStatus: doorStatus): JSX.Element[] => {
    if (doorStatus.state === "opened") {
      return [
        <image
          x="870"
          y="200"
          width="244"
          height="375"
          xlinkHref="./door_open.png"
        ></image>,
      ];
    }
    if (doorStatus.state === "closed" && doorStatus.lockState === "locked") {
      return [
        <image
          x="870"
          y="200"
          width="244"
          height="375"
          xlinkHref="./door.png"
        ></image>,
        <image
          x="950"
          y="250"
          width="112"
          height="125"
          xlinkHref="./lock.png"
        ></image>,
      ];
    }
    return [
      <image
        x="870"
        y="200"
        width="244"
        height="375"
        xlinkHref="./door.png"
      ></image>,
      <image
        x="950"
        y="250"
        width="112"
        height="125"
        xlinkHref="./unlock.png"
      ></image>,
    ];
  };
  getAirConditionerImage = (
    airConditioner: airConditionerStatus
  ): JSX.Element[] => {
    if (airConditioner.state === "off") {
      return [];
    }
    let color = "#000000";
    if (airConditioner.state === "cool") {
      color = "#0000FF";
    }
    if (airConditioner.state === "heat") {
      color = "#FF0000";
    }
    if (airConditioner.state === "dry") {
      color = "#00C000";
    }
    if (airConditioner.state === "wind") {
      color = "#00A0A0";
    }
    return [
      <line
        x1="120"
        y1="230"
        x2="130"
        y2="270"
        style={{
          stroke: color,
          strokeWidth: 12,
          strokeLinecap: "round",
        }}
      />,
      <line
        x1="160"
        y1="230"
        x2="170"
        y2="270"
        style={{
          stroke: color,
          strokeWidth: 12,
          strokeLinecap: "round",
        }}
      />,
      <line
        x1="200"
        y1="230"
        x2="210"
        y2="270"
        style={{
          stroke: color,
          strokeWidth: 12,
          strokeLinecap: "round",
        }}
      />,
      <line
        x1="240"
        y1="230"
        x2="250"
        y2="270"
        style={{
          stroke: color,
          strokeWidth: 12,
          strokeLinecap: "round",
        }}
      />,
    ];
  };
  getFloorLightImage = (floorLight: floorLightStatus): JSX.Element[] => {
    if (floorLight.state === "off") {
      return [];
    }
    let color = "#fbcb00";
    if (floorLight.color === "白色") {
      color = "#E0E0E0";
    }
    if (floorLight.color === "昼白色") {
      color = "#E0E080";
    }
    return [
      <line
        x1="50"
        y1="538"
        x2="40"
        y2="573"
        style={{
          stroke: color,
          strokeWidth: 12,
          strokeLinecap: "round",
        }}
      />,
      <line
        x1="89"
        y1="538"
        x2="89"
        y2="571"
        style={{
          stroke: color,
          strokeWidth: 12,
          strokeLinecap: "round",
        }}
      />,
      <line
        x1="128"
        y1="538"
        x2="137"
        y2="571"
        style={{
          stroke: color,
          strokeWidth: 12,
          strokeLinecap: "round",
        }}
      />,
    ];
  };
  getBathImage = (bathStatus: bathStatus): JSX.Element[] => {
    if (bathStatus.state === "empty") {
      return [
        <image
          x="900"
          y="500"
          width="400"
          height="466"
          xlinkHref="./bath_empty.png"
        ></image>,
      ];
    }
    if (bathStatus.state === "drainage") {
      return [
        <image
          x="900"
          y="500"
          width="400"
          height="466"
          xlinkHref="./bath_empty.png"
        ></image>,
        <image
          x="1000"
          y="600"
          width="134"
          height="132"
          xlinkHref="./downArrow.png"
        ></image>,
      ];
    }
    if (bathStatus.state === "supply") {
      return [
        <image
          x="900"
          y="500"
          width="400"
          height="466"
          xlinkHref="./bath_empty.png"
        ></image>,
        <image
          x="1000"
          y="600"
          width="134"
          height="132"
          xlinkHref="./upArrow.png"
        ></image>,
      ];
    }
    return [
      <image
        x="900"
        y="500"
        width="400"
        height="466"
        xlinkHref="./bath_full.png"
      ></image>,
    ];
  };
  getShutterImage = (shutterStatus: shutterStatus): JSX.Element[] => {
    if (shutterStatus.state === "opened") {
      return [];
    }
    if (shutterStatus.state === "opening") {
      return [
        <image
          x="400"
          y="170"
          width="280"
          height="280"
          xlinkHref="./blinds.png"
        ></image>,
        <image
          x="500"
          y="250"
          width="134"
          height="132"
          xlinkHref="./upArrow.png"
        ></image>,
      ];
    }
    if (shutterStatus.state === "halfOpen") {
      return [
        <image
          x="400"
          y="170"
          width="280"
          height="280"
          xlinkHref="./blinds.png"
        ></image>,
      ];
    }
    if (shutterStatus.state === "closing") {
      return [
        <image
          x="400"
          y="170"
          width="280"
          height="280"
          xlinkHref="./blinds.png"
        ></image>,
        <image
          x="500"
          y="250"
          width="134"
          height="132"
          xlinkHref="./downArrow.png"
        ></image>,
      ];
    }
    return [
      <image
        x="400"
        y="170"
        width="280"
        height="280"
        xlinkHref="./shutter_close.png"
      ></image>,
    ];
  };
}

export default App;
