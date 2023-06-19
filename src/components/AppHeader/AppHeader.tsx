import React, { useContext } from "react"

import { IonHeader, IonToolbar } from "@ionic/react"

import {
  IoArrowBackCircleOutline,
  IoArrowForwardCircleOutline,
} from "react-icons/io5"
import { Button } from "@mui/material"
import { SentenceContext } from "../../App"

export const AppHeader: React.FC = () => {
  const { sentences, setSentences } = useContext(SentenceContext)
  const { curIndex, setCurIndex } = useContext(SentenceContext)

  console.log("theme in header:", sentences)

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

  return (
    <IonHeader>
      <IonToolbar>
        <Button onClick={onPrevHandler}>
          <IoArrowBackCircleOutline size={32} />
        </Button>
        Sentence {curIndex} of {sentences.length}
        <Button onClick={onNextHandler}>
          <IoArrowForwardCircleOutline size={32} />
        </Button>
      </IonToolbar>
    </IonHeader>
  )
}
