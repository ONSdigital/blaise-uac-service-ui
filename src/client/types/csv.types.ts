export type CsvDatas = (
  | string[]
  | {
      [key: string]: string | number | null | undefined;
    }
)[];
