import React, { useContext, useEffect, useRef, useState } from "react"
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react"
import {
  DragDropContext,
  StrictModeDroppable,
  Draggable,
  DropResult,
  DraggableLocation,
} from "../components/Droppable"
import { Button, Grid, Input, Stack } from "@mui/material"
import { IoCaretUp, IoCaretDown } from "react-icons/io5"
import "./Home.css"

import { SentenceContext } from "../App"

const grid = 3

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 ${grid}px 0 0`,

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "white",

  // styles we need to apply on draggables
  ...draggableStyle,
})

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  display: "flex",
  padding: grid,
  overflow: "auto",
})

const Home: React.FC = () => {
  const {
    sentences,
    originText,
    itemArrays,
    curIndex,
    setGlobalSentences,
    setGlobalItemArrays,
  } = useContext(SentenceContext)

  const clickRef = useRef(0)

  useEffect(() => {
    if (sentences.length && itemArrays.length < curIndex + 1) {
      console.log(getItems())
      setGlobalItemArrays(curIndex, getItems())
    }
  }, [sentences, curIndex])

  const getItems = () => {
    return [{
      chunk: sentences[curIndex].sourceString
        .split(/ +/)
        .map((w: string, n: number) => ({
          id: `item-${n}`,
          content: w,
        })),
      gloss: "",
    }]
  }

  const reorder = (list: Array<any>, startIndex: number, endIndex: number) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    return result
  }

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result

    // dropped outside the list
    if (!destination) {
      return
    }

    const sInd = +source.droppableId
    const dInd = +destination.droppableId

    if (sInd === dInd) {
      const newItems = reorder(
        itemArrays[curIndex][sInd].chunk,
        source.index,
        destination.index
      )
      const newItemArrays = [...itemArrays[curIndex]]
      newItemArrays[sInd] = { chunk: newItems, gloss: "" }
      setGlobalItemArrays(curIndex, newItemArrays)
      // setGlobalSentences(curIndex, itemArraysToSourceString(newItemArrays))
    } else {
      const result = move(
        itemArrays[curIndex][sInd].chunk,
        itemArrays[curIndex][dInd].chunk,
        source,
        destination
      )
      const newItemArrays = [...itemArrays[curIndex]]
      newItemArrays[sInd].chunk = result[sInd]
      newItemArrays[dInd].chunk = result[dInd]
      newItemArrays[sInd].gloss = ""
      newItemArrays[dInd].gloss = ""

      setGlobalItemArrays(
        curIndex,
        newItemArrays.filter((group) => group.chunk.length)
      )
      // setGlobalSentences(curIndex, itemArraysToSourceString(newItemArrays))
    }
  }

  const handleDoubleClick = (item: any, rowN: number, colN: number) => {
    clickRef.current += 1

    if (clickRef.current === 1) {
      setTimeout(() => {
        if (clickRef.current === 2) {
          // Double click logic
          let newItemArrays = [...itemArrays[curIndex]]
          if (
            colN === newItemArrays[rowN].chunk.length ||
            (colN === 0 && rowN === 0)
          ) {
            // first col in first row
            return
          }
          if (colN === 0) {
            // merge with previous row
            newItemArrays[rowN - 1].chunk = [
              ...newItemArrays[rowN - 1].chunk,
              ...newItemArrays[rowN].chunk,
            ]
            newItemArrays[rowN - 1].gloss = ""
            newItemArrays[rowN].chunk = []
            newItemArrays[rowN].gloss = ""
            newItemArrays = newItemArrays.filter((a) => a.chunk.length)
          } else {
            // Make new row
            newItemArrays = [
              ...newItemArrays.slice(0, rowN),
              { chunk: newItemArrays[rowN].chunk.slice(0, colN), gloss: "" },
              { chunk: newItemArrays[rowN].chunk.slice(colN), gloss: "" },
              ...newItemArrays.slice(rowN + 1),
            ]
          }
          setGlobalItemArrays(curIndex, newItemArrays)
          // setGlobalSentences(curIndex, itemArraysToSourceString(newItemArrays))
        }

        clickRef.current = 0
      }, 300)
    }
  }

  /**
   * Moves an item from one chunk to another chunk.
   */
  const move = (
    source: Iterable<unknown> | ArrayLike<unknown>,
    destination: Iterable<unknown> | ArrayLike<unknown>,
    droppableSource: DraggableLocation,
    droppableDestination: DraggableLocation
  ) => {
    const sourceClone = Array.from(source)
    const destClone = Array.from(destination)
    const [removed] = sourceClone.splice(droppableSource.index, 1)

    destClone.splice(droppableDestination.index, 0, removed)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: { [key: string]: any } = {}
    result[droppableSource.droppableId] = sourceClone
    result[droppableDestination.droppableId] = destClone

    return result
  }

  // const itemArraysToSourceString = (newItemArrays: IChunk[]) => {
  //   const newSourceString = newItemArrays.map(({ chunk, gloss }) => {
  //     return {
  //       value: chunk.map((arr) => arr.content).join(" "),
  //       gloss,
  //     }
  //   })
  //   const newSources = [...sentences[curIndex]]
  //   newSources[0][0].sourceString = newSourceString

  //   return newSources
  // }

  const chunkUpHandler = (n: number) => {
    const newItemArrays = [...itemArrays[curIndex]]
    ;[newItemArrays[n - 1], newItemArrays[n]] = [
      newItemArrays[n],
      newItemArrays[n - 1],
    ]
    setGlobalItemArrays(curIndex, newItemArrays)
    // setGlobalSentences(curIndex, itemArraysToSourceString(newItemArrays))
  }

  const chunkDownHandler = (n: number) => {
    const newItemArrays = [...itemArrays[curIndex]]
    ;[newItemArrays[n], newItemArrays[n + 1]] = [
      newItemArrays[n + 1],
      newItemArrays[n],
    ]
    setGlobalItemArrays(curIndex, newItemArrays)
    // setGlobalSentences(curIndex, itemArraysToSourceString(newItemArrays))
  }

  const glossChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    n: number
  ) => {
    const newItemArrays = [...itemArrays[curIndex]]
    newItemArrays[n].gloss = e.target.value
    setGlobalItemArrays(curIndex, newItemArrays)
    // setGlobalSentences(curIndex, itemArraysToSourceString(newItemArrays))
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Blank</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <Grid container>
          <Grid item sm={4} p={2}>
            {originText[curIndex]}
          </Grid>
          <Grid item sm={8} p={2} pl={0} width="100%">
            <DragDropContext onDragEnd={onDragEnd}>
              {itemArrays[curIndex]?.map((items, n) => (
                <Grid container key={n} className="chunk-row">
                  <Grid item sm={6} px={2} py={1}>
                    <Stack flexDirection="row">
                      <Stack height={36} justifyContent="center">
                        <Button
                          sx={{ minWidth: "30px", height: "14px" }}
                          onClick={() => chunkUpHandler(n)}
                          disabled={!n}
                        >
                          <IoCaretUp />
                        </Button>
                        <Button
                          sx={{ minWidth: "30px", height: "14px" }}
                          onClick={() => chunkDownHandler(n)}
                          disabled={n === itemArrays[curIndex].length - 1}
                        >
                          <IoCaretDown />
                        </Button>
                      </Stack>
                      <StrictModeDroppable
                        droppableId={`${n}`}
                        direction="horizontal"
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                            {...provided.droppableProps}
                          >
                            {items.chunk.map((item, index) => (
                              <Draggable
                                key={item.id}
                                draggableId={item.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={getItemStyle(
                                      snapshot.isDragging,
                                      provided.draggableProps.style
                                    )}
                                    onClick={() =>
                                      handleDoubleClick(item, n, index)
                                    }
                                  >
                                    {item.content}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </StrictModeDroppable>
                    </Stack>
                  </Grid>
                  <Grid item sm={6} px={2} py={1}>
                    <Input
                      value={items.gloss}
                      onChange={(e) => glossChangeHandler(e, n)}
                      fullWidth
                    ></Input>
                  </Grid>
                </Grid>
              ))}
            </DragDropContext>
          </Grid>
        </Grid>
      </IonContent>
    </IonPage>
  )
}

export default Home
