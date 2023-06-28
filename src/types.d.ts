interface IWorkspace {
  [key: string]: any
}

interface IOutput {
  [key: string]: Array<
    Array<{
      [key: string]: any
    }>
  >
  sentences: ISentence[][][]
}

interface IContext {
  sequences: any
}

interface ISource {
  content: string
  cv: string
  lemma: Array<string>
  morph: Array<string>
  occurence: number
  occurences: number
  strong: Array<string>
  id: string
}

interface ISentence {
  gloss: string
  source: ISource[]
  sourceString: Array<string>
}

interface ISentenceContext {
  sentences: ISentence[][][]
  itemArrays: IItem[][][]
  curIndex: number
  setGlobalSentences: (index: number, sentence: ISentence[][]) => void
  setGlobalTotalSentences: (sentences: ISentence[][][]) => void
  setGlobalItemArrays: (index: number, itemArrays: IItem[][]) => void
  setCurIndex: (curIndex: number) => void
}

interface IItem {
  id: string
  content: string
}