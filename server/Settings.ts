
export interface Settings {
  devices?:{
    monoFunctionalLighting?:{
      disabled?:boolean;
      id?: string;
    };
    temperatureSensor?:{
      disabled?:boolean;
      id?: string;
    };
    humiditySensor?:{
      disabled?:boolean;
      id?: string;
    };
    humanDetectionSensor?:{
      disabled?:boolean;
      id?: string;
    };
    generalLighting?:{
      disabled?:boolean;
      id?: string;
    };
    electricallyOperatedRainSlidingDoorShutter?:{
      disabled?:boolean;
      id?: string;
    };
    electricLock?:{
      disabled?:boolean;
      id?: string;
    };
    switch?:{
      disabled?:boolean;
      id?: string;
    };
    homeAirConditioner?:{
      disabled?:boolean;
      id?: string;
    };
    electricWaterHeater?:{
      disabled?:boolean;
      id?: string;
    };
  }
  nodeProfileId?:string;
}

export class Settings
{
  static createEmpty = ():Settings =>{
    return {};
  }

  static validate = (settings:Settings):ValidationResult =>{

    let message = "";
    for(const key in (settings?.devices ?? {}))
    {
      const id = ((settings.devices as any)[key]?.id as string) ?? "";
      
      if(id !== "")
      {
        if(id.match(/^fe[0-9a-fA-F]{32}$/i) === null)
        {
          // ${key}のidが不正です。feから始まる34桁HEXである必要があります。
          message += `invalid id for ${key}. id must be 34 characters long and start with fe.\n`;
        }
      }
    }

    return {
      valid:message === "",
      message:message
    };
  }
}

interface ValidationResult
{
  valid:boolean;
  message:string;
}