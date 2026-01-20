"use client"
import { useState, useEffect } from "react"

type Project = {
  id: number
  name: string
  area: number
}

type Inspiration = {
  id: number
  image: string
  projectId: number
}

export default function Home() {

  // Splash
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(t)
  }, [])

  // Tabs & screens
  const [tab, setTab] = useState<"projects" | "inspiration">("projects")
  const [screen, setScreen] = useState<"dashboard" | "details" | "calculator">("dashboard")

  const [activeProject, setActiveProject] = useState<Project | null>(null)

  // UI
  const [darkMode, setDarkMode] = useState(true)

  // Projects (LocalStorage)
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("projects")
    if (saved) setProjects(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects))
  }, [projects])

  // Inspirations (LocalStorage)
  const [inspirations, setInspirations] = useState<Inspiration[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("inspirations")
    if (saved) setInspirations(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem("inspirations", JSON.stringify(inspirations))
  }, [inspirations])

  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Calculator
  const [length, setLength] = useState("")
  const [width, setWidth] = useState("")
  const [height, setHeight] = useState("")
  const [result, setResult] = useState<string | null>(null)

  // Save project
  const [showSave, setShowSave] = useState(false)
  const [projectName, setProjectName] = useState("")

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-900 text-white">
        🎨 Laster...
      </div>
    )
  }

  function calculate() {
    if (!length || !width || !height) return

    const area = 2 * (parseFloat(length) + parseFloat(width)) * parseFloat(height)
    const liters = area / 8

    setResult(liters.toFixed(2))
  }

  function saveProject() {
    if (!projectName || !result) return

    const area = Math.round(
      2 * (parseFloat(length) + parseFloat(width)) * parseFloat(height)
    )

    setProjects([...projects, {
      id: Date.now(),
      name: projectName,
      area
    }])

    setProjectName("")
    setShowSave(false)
    setScreen("dashboard")
  }

  function addInspiration(e: any) {

    if (!selectedProjectId) {
      alert("Velg prosjekt først")
      return
    }

    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setInspirations([
        ...inspirations,
        {
          id: Date.now(),
          image: reader.result as string,
          projectId: selectedProjectId
        }
      ])
    }

    reader.readAsDataURL(file)
  }

  const bg = darkMode ? "bg-gray-900" : "bg-gray-100"
  const card = darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"

  return (
    <div className={`min-h-screen ${bg} flex justify-center items-center`}>
      <div className={`w-full max-w-md p-5 rounded-xl shadow-xl ${card}`}>

        {/* Top nav */}
        <div className="flex justify-between mb-3">
          <button onClick={() => setTab("projects")}>🏠 Prosjekter</button>
          <button onClick={() => setTab("inspiration")}>🎨 Inspirasjon</button>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        {/* ============ PROJECT TAB ============ */}

        {tab === "projects" && (
          <>
            {screen === "dashboard" && (
              <>
                <h2 className="font-bold mb-3">Mine prosjekter</h2>

                <div className="grid grid-cols-2 gap-3">

                  {projects.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setActiveProject(p)
                        setScreen("details")
                      }}
                      className="bg-gray-700 p-3 rounded-xl cursor-pointer"
                    >
                      <h3>{p.name}</h3>
                      <p className="text-sm opacity-70">{p.area} m²</p>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      setLength("")
                      setWidth("")
                      setHeight("")
                      setResult(null)
                      setScreen("calculator")
                    }}
                    className="border-2 border-dashed p-3 rounded-xl"
                  >
                    + Nytt prosjekt
                  </button>

                </div>
              </>
            )}

            {screen === "details" && activeProject && (
              <>
                <button onClick={() => setScreen("dashboard")}>← Tilbake</button>

                <h2 className="text-xl font-bold mt-2">
                  {activeProject.name}
                </h2>

                <p className="opacity-70 mb-3">
                  {activeProject.area} m²
                </p>

                <h3 className="font-semibold mb-2">🎨 Inspirasjon</h3>

                <div className="grid grid-cols-2 gap-2 mb-4">

                  {inspirations
                    .filter(i => i.projectId === activeProject.id)
                    .map(i => (
                      <img
                        key={i.id}
                        src={i.image}
                        onClick={() => setPreviewImage(i.image)}
                        className="rounded-xl aspect-square object-cover"
                      />
                    ))}

                </div>

                <button
                  onClick={() => setScreen("calculator")}
                  className="w-full bg-indigo-600 p-3 rounded-xl"
                >
                  Beregn på nytt
                </button>

              </>
            )}

            {screen === "calculator" && (
              <>
                <button onClick={() => setScreen("dashboard")}>← Tilbake</button>

                <div className="space-y-2 mt-3">

                  <input placeholder="Lengde" value={length} onChange={e => setLength(e.target.value)} className="w-full p-2 rounded bg-gray-700" />
                  <input placeholder="Bredde" value={width} onChange={e => setWidth(e.target.value)} className="w-full p-2 rounded bg-gray-700" />
                  <input placeholder="Høyde" value={height} onChange={e => setHeight(e.target.value)} className="w-full p-2 rounded bg-gray-700" />

                  <button onClick={calculate} className="w-full bg-blue-600 p-3 rounded-xl">
                    Beregn maling
                  </button>

                  {result && (
                    <div className="bg-gray-700 p-3 rounded-xl">
                      <p>✅ {result} liter</p>

                      <button
                        onClick={() => setShowSave(true)}
                        className="w-full bg-green-600 mt-2 p-2 rounded-xl"
                      >
                        Lagre prosjekt
                      </button>
                    </div>
                  )}

                </div>
              </>
            )}
          </>
        )}

        {/* ============ INSPIRATION TAB ============ */}

        {tab === "inspiration" && (
          <>
            <h2 className="font-bold mb-3">Legg inspirasjon til prosjekt</h2>

            <select
              className="w-full p-2 rounded mb-3 bg-gray-700"
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            >
              <option value="">Velg prosjekt</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <label className="block bg-indigo-600 text-center p-3 rounded-xl cursor-pointer">
              + Last opp bilde
              <input type="file" hidden accept="image/*" onChange={addInspiration} />
            </label>

          </>
        )}

        {/* IMAGE PREVIEW */}

        {previewImage && (
          <div
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 bg-black/80 flex justify-center items-center"
          >
            <img src={previewImage} className="max-w-[90%] max-h-[90%] rounded-xl" />
          </div>
        )}

        {/* SAVE PROJECT */}

        {showSave && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center">

            <div className="bg-white text-black p-5 rounded-xl w-64">

              <h3 className="font-bold mb-2">Lagre prosjekt</h3>

              <input
                placeholder="Prosjektnavn"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                className="border p-2 w-full rounded mb-3"
              />

              <button
                onClick={saveProject}
                className="bg-blue-600 text-white w-full p-2 rounded"
              >
                Lagre
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}
