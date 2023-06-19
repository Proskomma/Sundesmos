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
} from '../components/Droppable';
import { Button, Grid, Stack } from "@mui/material"
import "./Home.css"

import { SentenceContext } from "../App"
import { readUsfm } from "../utils/readUsfm"

const grid = 3

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 ${grid}px 0 0`,

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "black",

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
  const usfmOpenRef = useRef<HTMLInputElement>(null)

  const { sentences, curIndex, setSentences } = useContext(SentenceContext)
  const [itemArrays, setItemArrays] = useState<
    { id: string; content: string }[][]
  >([])

  useEffect(() => {
    if (sentences.length) {
      setItemArrays([getItems()])
    }
  }, [sentences, curIndex])

  const getItems = () =>
    sentences[curIndex][0].sourceString
      .split(/ +/)
      .map((w: string, n: number) => ({
        id: `item-${n}`,
        content: w,
      }))

  const openUsfm = () => {
    usfmOpenRef.current?.click()
  }

  const openUsfmHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.item(0)) {
      return
    }

    let srcUsfm
    try {
      srcUsfm = await e.target.files.item(0)?.text()
    } catch (err) {
      console.log(`Could not load srcUsfm: ${err}`)
      return
    }

    setSentences(readUsfm(srcUsfm))
  }

  const reorder = (
    list: { id: string; content: string }[],
    startIndex: number,
    endIndex: number,
  ) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
  
    return result;
  };

  const onDragEnd = (result: any, n: number) => {
    // dropped outside the list
    if (!result.destination) {
        return;
    }
    const newItems = reorder(
        itemArrays[n],
        result.source.index,
        result.destination.index
    );
    const newItemArrays = [...itemArrays];
    newItemArrays[n] = newItems;
    setItemArrays(newItemArrays);
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Blank</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {/* <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Blank</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer /> */}
        <Stack flexDirection={"row"}>
          <Button variant="contained" onClick={openUsfm}>
            Open usfm
          </Button>
          <Button variant="contained">Save usfm</Button>
          <input
            type="file"
            ref={usfmOpenRef}
            onChange={openUsfmHandler}
            hidden
          />
        </Stack>
        <Grid container spacing={2}>
          <Grid item sm={4}>
            {sentences.length ? sentences[curIndex][0].sourceString : ""}
          </Grid>
          <Grid item sm={4}>
            {itemArrays.map((items, n) => (
              <DragDropContext
                key={n}
                onDragEnd={(result) => onDragEnd(result, n)}
              >
                <StrictModeDroppable droppableId="droppable" direction="horizontal">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      style={getListStyle(snapshot.isDraggingOver)}
                      {...provided.droppableProps}
                    >
                      {items.map((item, index) => (
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
                              // onClick={(event) =>
                              //   event.detail === 2 &&
                              //   handleDoubleClick(item, n, index)
                              // }
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
              </DragDropContext>
            ))}
          </Grid>
          <Grid item sm={4}></Grid>
        </Grid>
      </IonContent>
    </IonPage>
  )
}

export default Home
