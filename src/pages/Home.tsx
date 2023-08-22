import React, { useContext, useEffect, useMemo, useRef, useState } from "react"
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
import { Box, Button, Grid, Input, Stack } from "@mui/material"
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
    if (sentences.length) {
      setGlobalItemArrays(curIndex, getItems())
    }
  }, [sentences, curIndex])

  const remakeSentence = (stc: ISentence) => {
    const chunks = stc.chunks.map((chunk) => {
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
      sourceString: stc.sourceString
    }
  }

  const getItems = () => {
    return sentences[curIndex].chunks
      .map(({ source, gloss }, index: number) => {
        return {
          chunk: source
            .filter((s) => s)
            .map((s: ISource, n: number) => {
              return {
                id: `item-${index * 1000 + n}`,
                content: s.content,
                index: s.index
              };
            }),
          gloss,
        };
      })
      .filter(({ chunk }) => chunk.length)
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
      // const newItems = reorder(
      //   itemArrays[curIndex][sInd].chunk,
      //   source.index,
      //   destination.index
      // )
      const newSource = reorder(
        sentences[curIndex].chunks[sInd].source,
        source.index,
        destination.index
      )
      // const newItemArrays = [...itemArrays[curIndex]]
      // newItemArrays[sInd] = { chunk: newItems, gloss: "" }

      const newChunks = [...sentences[curIndex].chunks]
      newChunks[sInd].source = newSource

      // setGlobalItemArrays(curIndex, newItemArrays)
      const newSentence = remakeSentence({
        chunks: newChunks,
        sourceString: sentences[curIndex].sourceString,
      })
      setGlobalSentences(curIndex, newSentence)
    } else {
      // const result = move(
      //   itemArrays[curIndex][sInd].chunk,
      //   itemArrays[curIndex][dInd].chunk,
      //   source,
      //   destination
      // )
      // const newItemArrays = [...itemArrays[curIndex]]
      // newItemArrays[sInd].chunk = result[sInd]
      // newItemArrays[dInd].chunk = result[dInd]
      // newItemArrays[sInd].gloss = ""
      // newItemArrays[dInd].gloss = ""

      const sentenceRes = move(
        sentences[curIndex].chunks[sInd].source,
        sentences[curIndex].chunks[dInd].source,
        source,
        destination
      )

      const newChunks = [...sentences[curIndex].chunks]
      newChunks[sInd].source = sentenceRes[sInd]
      newChunks[dInd].source = sentenceRes[dInd]
      newChunks[sInd].gloss = ""
      newChunks[dInd].gloss = ""

      // setGlobalItemArrays(
      //   curIndex,
      //   newItemArrays.filter((group) => group.chunk.length)
      // )
      const newSentence = remakeSentence({
        chunks: newChunks,
        sourceString: sentences[curIndex].sourceString,
      })
      setGlobalSentences(curIndex, newSentence)
    }
  }

  const handleDoubleClick = (item: any, rowN: number, colN: number) => {
    clickRef.current += 1

    if (clickRef.current === 1) {
      setTimeout(() => {
        if (clickRef.current === 2) {
          // Double click logic
          // let newItemArrays = [...itemArrays[curIndex]]
          let newChunks = [...sentences[curIndex].chunks]
          if (
            colN === itemArrays[curIndex][rowN].chunk.length ||
            (colN === 0 && rowN === 0)
          ) {
            // first col in first row
            return
          }
          if (colN === 0) {
            // merge with previous row
            // newItemArrays[rowN - 1].chunk = [
            //   ...newItemArrays[rowN - 1].chunk,
            //   ...newItemArrays[rowN].chunk,
            // ]
            // newItemArrays[rowN - 1].gloss = ""
            // newItemArrays[rowN].chunk = []
            // newItemArrays[rowN].gloss = ""
            // newItemArrays = newItemArrays.filter((a) => a.chunk.length)

            newChunks[rowN - 1].source = [
              ...newChunks[rowN - 1].source,
              ...newChunks[rowN].source,
            ]
            newChunks[rowN - 1].gloss = ""
            newChunks[rowN].source = []
            newChunks[rowN].gloss = ""
            newChunks = newChunks.filter((c) => c.source.length)
          } else {
            // Make new row
            // newItemArrays = [
            //   ...newItemArrays.slice(0, rowN),
            //   { chunk: newItemArrays[rowN].chunk.slice(0, colN), gloss: "" },
            //   { chunk: newItemArrays[rowN].chunk.slice(colN), gloss: "" },
            //   ...newItemArrays.slice(rowN + 1),
            // ]

            newChunks = [
              ...newChunks.slice(0, rowN),
              { source: newChunks[rowN].source.slice(0, colN), gloss: "" },
              { source: newChunks[rowN].source.slice(colN), gloss: "" },
              ...newChunks.slice(rowN + 1),
            ]
          }
          // setGlobalItemArrays(curIndex, newItemArrays)
          const newSentence = remakeSentence({
            chunks: newChunks,
            sourceString: sentences[curIndex].sourceString,
          })
          setGlobalSentences(curIndex, newSentence)
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
    // const newItemArrays = [...itemArrays[curIndex]]
    // ;[newItemArrays[n - 1], newItemArrays[n]] = [
    //   newItemArrays[n],
    //   newItemArrays[n - 1],
    // ]
    const newChunks = [...sentences[curIndex].chunks]
    ;[newChunks[n - 1], newChunks[n]] = [newChunks[n], newChunks[n - 1]]
    // setGlobalItemArrays(curIndex, newItemArrays)
    const newSentence = remakeSentence({
      chunks: newChunks,
      sourceString: sentences[curIndex].sourceString,
    })
    setGlobalSentences(curIndex, newSentence)
  }

  const chunkDownHandler = (n: number) => {
    // const newItemArrays = [...itemArrays[curIndex]]
    // ;[newItemArrays[n], newItemArrays[n + 1]] = [
    //   newItemArrays[n + 1],
    //   newItemArrays[n],
    // ]
    const newChunks = [...sentences[curIndex].chunks]
    ;[newChunks[n], newChunks[n + 1]] = [newChunks[n + 1], newChunks[n]]
    // setGlobalItemArrays(curIndex, newItemArrays)
    const newSentence = remakeSentence({
      chunks: newChunks,
      sourceString: sentences[curIndex].sourceString,
    })
    setGlobalSentences(curIndex, newSentence)
  }

  const glossChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    n: number
  ) => {
    const newItemArrays = [...itemArrays[curIndex]]
    newItemArrays[n].gloss = e.target.value
    const newChunks = [...sentences[curIndex].chunks]
    newChunks[n].gloss = e.target.value
    setGlobalItemArrays(curIndex, newItemArrays)
    setGlobalSentences(curIndex, {
      chunks: newChunks,
      sourceString: sentences[curIndex].sourceString,
    })
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
                                    <Stack flexDirection={"row"} gap={"6px"}>
                                    <Box>{item.content}</Box>
                                      {item.index ? (
                                        <Box sx={{ fontSize: "10px" }}>
                                          {item.index}
                                        </Box>
                                      ) : (
                                        <></>
                                      )}
                                    </Stack>
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
                      sx={{ fontStyle: 'italic' }}
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
