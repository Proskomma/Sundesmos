import React, { useContext, useRef } from "react"

import { IonHeader, IonToolbar } from "@ionic/react"

import {
  IoArrowBackCircleOutline,
  IoArrowForwardCircleOutline,
} from "react-icons/io5"
import { Button, Box, Stack } from "@mui/material"
import { SentenceContext } from "../../App"

import { readUsfm } from "../../utils/readUsfm"
import saveAs from "file-saver"

export const AppHeader: React.FC = () => {
  const usfmOpenRef = useRef<HTMLInputElement>(null)
  const jsonOpenRef = useRef<HTMLInputElement>(null)

  const {
    fileName,
    sentences,
    curIndex,
    setFileName,
    setGlobalTotalSentences,
    setOriginText,
    setCurIndex,
  } = useContext(SentenceContext)

  const onPrevHandler = () => {
    if (curIndex > 0) {
      setCurIndex(curIndex - 1)
    }
  }

  const onNextHandler = () => {
    if (curIndex < sentences.length - 1) {
      setCurIndex(curIndex + 1)
      console.log(sentences[curIndex].chunks.slice(-1))
    }
  }

  const firstSource = () =>
    sentences.length ? sentences[curIndex].chunks[0]?.source[0] : null

  const lastSource = () =>
    sentences.length ? sentences[curIndex].chunks.slice(-1)[0]?.source.slice(-1)[0] : null

  const currentChapter = () => firstSource()?.cv.split(":")[0] ?? 0

  const startVerse = () => firstSource()?.cv.split(":")[1] ?? 0

  const endVerse = () => lastSource()?.cv.split(":")[1] ?? 0

  const openUsfm = () => {
    usfmOpenRef.current?.click()
  }

  const openJson = () => {
    jsonOpenRef.current?.click()
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
    setGlobalTotalSentences(res)
    setOriginText(res.map((sentence) => sentence.sourceString))
  }

  const openJsonHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.item(0)) {
      return
    }
    const data = await e.target.files.item(0)?.text()
    if (data) {
      const stcs = JSON.parse(data)
      console.log(stcs)
      setGlobalTotalSentences(stcs)
      setOriginText(stcs.map((sentence: any) => sentence.sourceString))
    }
  }

  const saveJsonHandler = () => {
    const json = JSON.stringify(sentences)
    const blob = new Blob([json], { type: "application/json" })

    saveAs(blob, "data.json")
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
              onChange={openUsfmHandler}
              hidden
            />
          </Stack>
          <Button onClick={onPrevHandler}>
            <IoArrowBackCircleOutline size={32} />
          </Button>
          <Stack alignItems="center">
            <Box sx={{ fontStyle: "italic" }}>{fileName}</Box>
            <Box sx={{ color: "grey", fontSize: "14px" }}>
              Sentence {sentences.length ? curIndex + 1 : 0} of{" "}
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
            <input
              type="file"
              ref={jsonOpenRef}
              onChange={openJsonHandler}
              hidden
            />
          </Stack>
        </Stack>
      </IonToolbar>
    </IonHeader>
  )
}
