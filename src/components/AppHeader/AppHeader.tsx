import React, { useContext, useRef } from "react"

import { IonHeader, IonToolbar } from "@ionic/react"

import {
  IoArrowBackCircleOutline,
  IoArrowForwardCircleOutline,
} from "react-icons/io5"
import { Button, Box, Stack, Input } from "@mui/material"
import { SentenceContext } from "../../App"

import { readUsfm } from "../../utils/readUsfm"
import saveAs from "file-saver"

export const AppHeader: React.FC = () => {
  const usfmOpenRef = useRef<HTMLInputElement>(null)
  const jsonOpenRef = useRef<HTMLInputElement>(null)

  const {
    fileName,
    sentences,
    itemArrays,
    curIndex,
    setFileName,
    setGlobalTotalSentences,
    setItemArrays,
    setOriginText,
    setCurIndex,
  } = useContext(SentenceContext)

  const getItems = (res: ISentence[]) => {
    return res[0].chunks
      .map(({ source, gloss }, index: number) => {
        return {
          chunk: source
            .filter((s) => s)
            .map((s: ISource, n: number) => {
              return {
                id: `item-${index * 1000 + n}`,
                content: s.content,
                index: s.index,
              };
            }),
          gloss,
        };
      })
      .filter(({ chunk }) => chunk.length)
  }

  const onPrevHandler = () => {
    if (curIndex > 0) {
      setCurIndex(curIndex - 1)
    }
  }

  const onNextHandler = () => {
    if (curIndex < sentences.length - 1) {
      setCurIndex(curIndex + 1)
    }
  }

  const firstSource = () => {
    if (
      !sentences.length ||
      !sentences[curIndex].chunks[0]?.source.length ||
      sentences[curIndex].chunks[0]?.source[0] === null
    ) {
      return null
    }
    return sentences[curIndex].chunks[0]?.source[0]
  }

  const lastSource = () => {
    if (
      !sentences.length ||
      !sentences[curIndex].chunks.slice(-1)[0]?.source.length ||
      sentences[curIndex].chunks.slice(-1)[0]?.source[0] === null
    ) {
      return null
    }
    return sentences.length ? sentences[curIndex].chunks.slice(-1)[0]?.source.slice(-1)[0] : null
  }

  const currentChapter = () => firstSource()?.cv.split(":")[0] ?? 0

  const startVerse = () => firstSource()?.cv.split(":")[1] ?? 0

  const endVerse = () => lastSource()?.cv.split(":")[1] ?? 0

  const openUsfm = () => {
    usfmOpenRef.current?.click()
  }

  const openJson = () => {
    jsonOpenRef.current?.click()
  }

  const openClickHandler = (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
    const element = e.target as HTMLInputElement
    element.value = ""
  }

  const openUsfmHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.item(0)) {
      return
    }
    const item = e.target.files.item(0)
    if (!item) {
      return
    }

    setFileName(item.name)
    let srcUsfm
    try {
      srcUsfm = await e.target.files.item(0)?.text()
    } catch (err) {
      console.log(`Could not load srcUsfm: ${err}`)
      return
    }

    const res = readUsfm(srcUsfm)
    setCurIndex(0)
    setGlobalTotalSentences(res.map((sentence: ISentence) => {
      const chunks = sentence.chunks.map((chunk) => {
        const source = chunk.source.map((src, i) => {
          let count = 0
          for (let j = 0; j < i; j++) {
            if (src.content === chunk.source[j].content) {
              count++
            }
          }
          return { ...src, index: count }
        })
        return {
          source,
          gloss: chunk.gloss
        }
      })
      return {
        chunks,
        sourceString: sentence.sourceString
      }
    }))
    setOriginText(res.map((sentence) => sentence.sourceString))
    if (res.length) {
      setItemArrays([getItems(res)])
    }
  }

  const openJsonHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.item(0)) {
      return
    }
    const item = e.target.files.item(0)
    if (!item) {
      return
    }

    setFileName(item.name)
    const data = await e.target.files.item(0)?.text()
    if (data) {
      const stcs = JSON.parse(data)
      setCurIndex(0)
      setGlobalTotalSentences(stcs)
      setOriginText(stcs.map((sentence: any) => sentence.sourceString))
      if(stcs.length) {
        setItemArrays([getItems(stcs)])
      }
    }
  }

  const saveJsonHandler = () => {
    const json = JSON.stringify(sentences)
    const blob = new Blob([json], { type: "application/json" })

    saveAs(blob, "data.json")
  }

  const indexChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const index = parseInt(e.target.value)
    if (index > 0 && index <= sentences.length) {
      setCurIndex(index - 1)
    }
  }

  return (
    <IonHeader>
      <IonToolbar>
        <Stack flexDirection="row" justifyContent="center" alignItems="center">
          <Stack flexDirection="row" justifyContent="center" gap={1}>
            <Button variant="contained" onClick={openUsfm}>
              Open usfm
            </Button>
            <Button variant="contained" onClick={openJson}>
              Open json
            </Button>
            <input
              type="file"
              ref={usfmOpenRef}
              onClick={openClickHandler}
              onChange={openUsfmHandler}
              hidden
            />
            <input
              type="file"
              ref={jsonOpenRef}
              onClick={openClickHandler}
              onChange={openJsonHandler}
              hidden
            />
          </Stack>
          <Button onClick={onPrevHandler}>
            <IoArrowBackCircleOutline size={32} />
          </Button>
          <Stack alignItems="center">
            <Box sx={{ fontStyle: "italic" }}>{fileName}</Box>
            <Box sx={{ color: "grey", fontSize: "14px" }}>
              Sentence
              <Input
                value={sentences.length ? curIndex + 1 : 0}
                sx={{ width: '30px' }}
                inputProps={{ style: { textAlign: 'center' }}}
                onChange={indexChangeHandler}
              />
              of{" "}
              {sentences.length} (ch:{currentChapter()}, v{startVerse()} -{" "}
              {endVerse()})
            </Box>
          </Stack>
          <Button onClick={onNextHandler}>
            <IoArrowForwardCircleOutline size={32} />
          </Button>
          <Stack flexDirection="row" justifyContent="center" gap={1}>
            <Button variant="contained">
              <a href="#" id="download-link" onClick={saveJsonHandler}>
                Save json
              </a>
            </Button>
            <Button variant="contained" disabled>
              Save usfm
            </Button>
          </Stack>
        </Stack>
      </IonToolbar>
    </IonHeader>
  )
}
