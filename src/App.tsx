import React, { useState, createContext } from "react"

import { Redirect, Route } from "react-router-dom"
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react"
import { IonReactRouter } from "@ionic/react-router"
import Home from "./pages/Home"

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css"

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css"
import "@ionic/react/css/structure.css"
import "@ionic/react/css/typography.css"

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css"
import "@ionic/react/css/float-elements.css"
import "@ionic/react/css/text-alignment.css"
import "@ionic/react/css/text-transformation.css"
import "@ionic/react/css/flex-utils.css"
import "@ionic/react/css/display.css"

/* Theme variables */
import "./theme/variables.css"
import { Layout } from "./components/Layout"

setupIonicReact()

export const SentenceContext = createContext<ISentenceContext>({
  sentences: [],
  curIndex: 0,
  setSentences: () => undefined,
  setCurIndex: (curId: number) => undefined,
})

const App: React.FC = () => {
  const [sentences, setSentences] = useState(new Array<Array<ISentence>>())
  const [curIndex, setCurIndex] = useState(0)

  return (
    <SentenceContext.Provider
      value={{ sentences, curIndex, setSentences, setCurIndex }}
    >
      <IonApp>
        <IonReactRouter>
          <Layout>
            <IonRouterOutlet>
              <Route exact path="/home">
                <Home />
              </Route>
              <Route exact path="/">
                <Redirect to="/home" />
              </Route>
            </IonRouterOutlet>
          </Layout>
        </IonReactRouter>
      </IonApp>
    </SentenceContext.Provider>
  )
}

export default App
