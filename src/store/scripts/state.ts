export interface ScriptsStateInterface {
  scripts: DTO.Script[]
  total: number,
  script: any,
  is_manager: boolean
}

function state(): ScriptsStateInterface {
  return {
    scripts: [],
    total: 0,
    script: {},
    is_manager: false,
  }
};

export default state;
