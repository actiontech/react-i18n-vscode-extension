export type ParamsLocation = {
  paramsValue: string;
  desc: string;
  start: {
    line: number;
    column: number;
    char?: string;
  };
  end: {
    line: number;
    column: number;
    char?: string;
  };
};
