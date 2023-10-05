import React from 'react';
// import { useRef } from 'react';
import {
  // IonMenu,
  IonPage,
  IonContent,
  // IonFooter,
  // IonMenuToggle,
} from '@ionic/react';
import { AppHeader } from '../AppHeader';

interface LayoutProps {
  children?: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <IonPage id="poc-juxtalinear-app">
        <AppHeader />
        <IonContent fullscreen>
          {children}
        </IonContent>
      </IonPage>
    </>
  )
}
