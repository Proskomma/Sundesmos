import React, { useContext } from "react"

import { IonHeader, IonToolbar } from "@ionic/react"

import {
  IoArrowBackCircleOutline,
  IoArrowForwardCircleOutline,
} from "react-icons/io5"
import { Button } from "@mui/material"
import { SentenceContext } from "../../App"

export const AppHeader: React.FC = () => {
  const { sentences, curIndex, setCurIndex } = useContext(SentenceContext)
  console.log(sentences)
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

  const currentSource = () => sentences.length ? sentences[curIndex][0].source : null

  const currentChapter = () => currentSource()?.at(0)?.cv.split(":")[0] ?? 0

  const startVerse = () => currentSource()?.at(0)?.cv.split(":")[1] ?? 0

  const endVerse = () => currentSource()?.at(-1)?.cv.split(":")[1] ?? 0

  return (
    <IonHeader>
      <IonToolbar>
        <Button onClick={onPrevHandler}>
          <IoArrowBackCircleOutline size={32} />
        </Button>
        Sentence {sentences.length ? curIndex + 1 : 0} of {sentences.length}{" "}
        (ch:{currentChapter()}, v{startVerse()} - {endVerse()})
        <Button onClick={onNextHandler}>
          <IoArrowForwardCircleOutline size={32} />
        </Button>
      </IonToolbar>
    </IonHeader>
  )
}
