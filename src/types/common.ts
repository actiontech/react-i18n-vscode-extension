export type ParamsLocation = {
  paramsValue: string;
  notFind: boolean;
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

export type LanguageValue = {
  value: string;
  line: number;
};
