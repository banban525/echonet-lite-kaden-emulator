declare module "echonet-lite" {
  export interface eldata {
    EHD: string;
    TID: string;
    SEOJ: string;
    DEOJ: string;
    EDATA: string;
    ESV: string;
    OPC: string;
    DETAIL: string;
    DETAILs: { [key: string]: string };
  }

  export interface rinfo {
    address: string;
  }

  const SETI_SNA: string;
  const SETC_SNA: string;
  const GET_SNA: string;
  const INF_SNA: string;
  const SETGET_SNA: string;
  const SETI: string;
  const SETC: string;
  const GET: string;
  const INF_REQ: string;
  const SETGET: string;
  const SET_RES: string;
  const GET_RES: string;
  const INF: string;
  const INFC: string;
  const INFC_RES: string;
  const SETGET_RES: string;
  const EL_port: number;
  const EL_Multi: string;
  const EL_Multi6: string;
  const Node_details: {
    "80": number[];
    "82": number[];
    "83": number[];
    "88": number[];
    "8a": number[];
    "9d": number[];
    "9e": number[];
    "9f"?: number[];
    d3: number[];
    d4: number[];
    d5: number[];
    d6: number[];
    d7: number[];
  };
  let EL_obj: string[];
  let EL_cls: string[];
  let ipVer: number;
  let nicList: {
    v4: { name: string; address: string }[];
    v6: { name: string; address: string }[];
  };
  let usingIF: { v4: string; v6: string };
  let tid: number[];
  let ignoreMe: boolean;
  let autoGetProperties: boolean;
  let autoGetDelay: boolean;
  let autoGetWaitings: boolean;
  let debugMode: boolean;
  let facilities: {
    [key: string]: { [key: string]: { [key: string]: string } };
  };
  let identificationNumbers: { id: string; ip: string; OBJ: string }[];

  export interface InitializeOptions {
    v4?: string;
    v6?: string;
    ignoreMe?: boolean;
    autoGetProperties?: boolean;
    autoGetDelay?: number;
    debugMode?: boolean;
  }

  function initialize(
    objList: string[],
    userfunc: (rinfo: rinfo, els: eldata) => void,
    ipVer?: number,
    Options?: InitializeOptions
  ): { sock4: any; sock6: any } | any;
  function renewNICList(): {
    v4: { name: string; address: string }[];
    v6: { name: string; address: string }[];
  };
  function decreaseWaitings(): void;
  function increaseWaitings(): void;
  function myIPaddress(rinfo: rinfo): boolean;
  function eldataShow(eldata: eldata): void;
  function stringShow(str: string): void;
  function bytesShow(bytes: number): void;
  function parseDetail(opc: number, str: string): { [key: string]: string };
  function parseBytes(bytes: number[]): eldata;
  function parseString(str: string): eldata;
  function getSeparatedString_String(str: string): string;
  function getSeparatedString_ELDATA(eldata: eldata): string;
  function ELDATA2Array(eldata: eldata): number[];
  function toHexString(byte: number): string;
  function toHexArray(string: string): number[];
  function bytesToString(bytes: number[]): string;
  function sendBase(ip: string, buffer: any): number[];
  function sendArray(ip: string, array: any): number[];
  function sendOPC1(
    ip: string,
    seoj: string | number[],
    deoj: string | number[],
    esv: string | number,
    epc: string | number,
    edt: string | number | number[]
  ): number[];
  function sendString(ip: string, string: string): number[];
  function returner(
    bytes: number[],
    rinfo: rinfo,
    userfunc:
      | ((rinfo: rinfo, els: eldata) => void)
      | ((rinfo: rinfo, els: eldata, e: any) => void)
  );
  function renewFacilities(ip: string, els: eldata): void;
  function setObserveFacilities(interval: number, onChanged: () => void): void;
  function objectSort(obj: any): any;
  function search(): void;
  function getPropertyMaps(ip: string, eoj: string | number[]): void;
  function parseMapForm2(bitstr: string): number[];
}
