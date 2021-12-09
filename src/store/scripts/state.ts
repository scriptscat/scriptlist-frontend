export interface ScriptsStateInterface {
  scripts: DTO.Script[]
  total: number,
  script: DTO.Script,
  is_manager: boolean
}

function state(): ScriptsStateInterface {
  return {
    scripts: [],
    total: 0,
    script: <DTO.Script>{},
    is_manager: false,
  }
};

export default state;
