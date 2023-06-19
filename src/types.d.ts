interface IWorkspace {
  [key: string]: any
}

interface IOutput {
  [key: string]: Array<
    Array<{
      [key: string]: any
    }>
  >
  sentences: ISentence[][]
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
}

interface ISentence {
  gloss?: string
  source?: ISource[]
  sourceString?: string
}

interface ISentenceContext {
  sentences: ISentence[][]
  curIndex: number
  setSentences: (sentences: ISentence[][]) => void
  setCurIndex: (curIndex: number) => void
}
