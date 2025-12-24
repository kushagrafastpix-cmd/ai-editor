import './App.css'
import { useState } from "react";
import { Header } from './components/Header'
import { Editor } from "./components/Editor";


function App() {

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleBack = () => {
    console.log("Navigate back");
  };

  const handleSave = async () => {
    setIsSaving(true);

    // simulate save
    await new Promise((res) => setTimeout(res, 1000));

    setIsSaving(false);
    setHasUnsavedChanges(false);
  };

  const handleExport = async () => {
    setIsExporting(true);

    // simulate export
    await new Promise((res) => setTimeout(res, 1500));

    setIsExporting(false);
  };

  return (
    <>
    <div className="flex h-screen flex-col">
      <Header
        title="What is FastPix? | All-in-One Video API Platform"
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        isExporting={isExporting}
        onBack={handleBack}
        onSave={handleSave}
        onExport={handleExport}
      />
      <main className="flex-1 overflow-hidden">
        <Editor />
      </main>
      </div>
    </>
  )
}

export default App
