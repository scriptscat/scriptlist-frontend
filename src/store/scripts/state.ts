export interface ScriptsStateInterface {
  scripts: DTO.Script[];
  version: DTO.ScriptCode[];
  total: number;
  script: DTO.Script | undefined;
  preFetch: boolean;
  errMsg: string;
}

function state(): ScriptsStateInterface {
  return {
    scripts: [],
    version: [],
    total: 0,
    script: undefined,
    preFetch: false,
    errMsg: '',
  };
}

export default state;
