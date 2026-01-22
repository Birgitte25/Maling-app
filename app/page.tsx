"use client"
import { useState, useEffect } from "react"

// ===== Types =====

type Wall = { width: string; height: string }

type Project = {
  id: number
  name: string
  walls: Wall[]
  windows: Wall[]
  doors: Wall[]
  coats: number
  area: number
  liters: number
}

// ===== App =====

export default function Home() {

  // Splash
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  // Theme
  const [darkMode, setDarkMode] = useState(true)

  // Navigation
  const [screen, setScreen] = useState<"home" | "calculator" | "projects" | "details">("home")

  // Projects
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProject, setActiveProject] = useState<Project | null>(null)

  const [showSave, setShowSave] = useState(false)
  const [projectName, setProjectName] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("projects")
    if (saved) setProjects(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects))
  }, [projects])

  // Calculator
  const emptyWall = { width: "", height: "" }

  const [walls, setWalls] = useState<Wall[]>([{ ...emptyWall }])
  const [windows, setWindows] = useState<Wall[]>([])
  const [doors, setDoors] = useState<Wall[]>([])
  const [coats, setCoats] = useState(2)

  const [netArea, setNetArea] = useState<number | null>(null)
  const [liters, setLiters] = useState<number | null>(null)

  // ===== Functions =====

  function resetCalculator() {
    setWalls([{ ...emptyWall }])
    setWindows([])
    setDoors([])
    setCoats(2)
    setNetArea(null)
    setLiters(null)
    setActiveProject(null)
  }

  function addWall() {
    setWalls([...walls, { ...emptyWall }])
  }

  function removeWall(i: number) {
    if (walls.length === 1) return
    setWalls(walls.filter((_, index) => index !== i))
  }

  function addWindow() {
    setWindows([...windows, { ...emptyWall }])
  }

  function removeWindow(i: number) {
    setWindows(windows.filter((_, index) => index !== i))
  }

  function addDoor() {
    setDoors([...doors, { ...emptyWall }])
  }

  function removeDoor(i: number) {
    setDoors(doors.filter((_, index) => index !== i))
  }

  function addStandardWindow(w: number, h: number) {
    setWindows([...windows, { width: w.toString(), height: h.toString() }])
  }

  function addStandardDoor(w: number, h: number) {
    setDoors([...doors, { width: w.toString(), height: h.toString() }])
  }

  function calculatePaint() {

    let wallArea = 0
    let openingArea = 0

    walls.forEach(w => {
      const a = parseFloat(w.width) * parseFloat(w.height)
      if (!isNaN(a)) wallArea += a
    })

    windows.forEach(w => {
      const a = parseFloat(w.width) * parseFloat(w.height)
      if (!isNaN(a)) openingArea += a
    })

    doors.forEach(d => {
      const a = parseFloat(d.width) * parseFloat(d.height)
      if (!isNaN(a)) openingArea += a
    })

    const usable = wallArea - openingArea

    if (usable <= 0) {
      alert("Ugyldig areal")
      return
    }

    const needed = (usable * coats) / 8

    setNetArea(Number(usable.toFixed(2)))
    setLiters(Number(needed.toFixed(2)))
  }

  function saveProject() {

    if (!projectName || netArea === null || liters === null) return

    const newProject: Project = {
      id: Date.now(),
      name: projectName,
      walls,
      windows,
      doors,
      coats,
      area: netArea,
      liters
    }

    setProjects([...projects, newProject])
    setShowSave(false)
    setProjectName("")
    resetCalculator()
    setScreen("projects")
  }

  function loadProject(p: Project) {

  setWalls(p.walls || [{ width: "", height: "" }])
  setWindows(p.windows || [])
  setDoors(p.doors || [])
  setCoats(p.coats || 2)
  setNetArea(p.area || null)
  setLiters(p.liters || null)

  setActiveProject(p)
  setScreen("calculator")
}
function deleteProject(id: number) {

  const confirmDelete = confirm("Vil du slette prosjektet permanent?")

  if (!confirmDelete) return

  setProjects(projects.filter(p => p.id !== id))

  setActiveProject(null)
  setScreen("projects")
}

  // ===== UI =====

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-900 text-white text-xl">
        🎨 Laster...
      </div>
    )
  }

  const bg = darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
  const card = darkMode ? "bg-gray-800" : "bg-white"

  return (
    <div className={`min-h-screen flex justify-center items-center p-4 ${bg}`}>

      <div className={`${card} p-5 rounded-2xl w-full max-w-md shadow-xl`}>

        {/* Top bar */}

        <div className="flex justify-between mb-3">
          <button onClick={() => setScreen("home")}>🏠</button>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        {/* HOME */}

        {screen === "home" && (
          <div className="space-y-3 text-center">

            <h1 className="text-2xl font-bold">🎨 Maling App</h1>

            <button
              onClick={() => {
                resetCalculator()
                setScreen("calculator")
              }}
              className="w-full bg-indigo-600 p-3 rounded-xl"
            >
              🧮 Rask beregning
            </button>

            <button
              onClick={() => setScreen("projects")}
              className="w-full bg-blue-600 p-3 rounded-xl"
            >
              🏠 Mine prosjekter
            </button>

          </div>
        )}

        {/* PROJECT LIST */}

        {screen === "projects" && (
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
                  className="bg-gray-700 p-3 rounded-xl cursor-pointer hover:bg-gray-600"
                >
                  <h3>{p.name}</h3>
                  <p className="text-sm opacity-70">
                    {p.area} m² • {p.liters} L
                  </p>
                </div>
              ))}

            </div>
          </>
        )}

        {/* PROJECT DETAILS */}

        {screen === "details" && activeProject && (
          <>
            <button
              onClick={() => setScreen("projects")}
              className="mb-2"
            >
              ← Tilbake
            </button>

            <h2 className="text-xl font-bold">
              {activeProject.name}
            </h2>

            <p className="opacity-70 mb-4">
              {activeProject.area} m² • {activeProject.liters} liter
            </p>

            <button
              onClick={() => loadProject(activeProject)}
              className="w-full bg-indigo-600 p-3 rounded-xl"
            >
              Rediger beregning
            </button>
            <button
  onClick={() => deleteProject(activeProject.id)}
  className="w-full bg-red-600 p-3 rounded-xl"
>
  Slett prosjekt
</button>

          </>
        )}

        {/* CALCULATOR */}

        {screen === "calculator" && (
          <>
            <button onClick={() => setScreen("home")} className="mb-2">
              ← Tilbake
            </button>

            <h2 className="font-bold mb-2">Kalkulator</h2>

            {/* WALLS */}

            <div className="bg-gray-700/40 p-3 rounded-xl mb-3">

              <h3 className="text-blue-400 mb-2">Vegger</h3>

              {walls.map((w, i) => (
                <div key={i} className="flex gap-2 mb-2">

                  <input
                    placeholder="Bredde"
                    value={w.width}
                    onChange={(e) => {
                      const copy = [...walls]
                      copy[i].width = e.target.value
                      setWalls(copy)
                    }}
                    className="w-full p-2 rounded bg-gray-700"
                  />

                  <input
                    placeholder="Høyde"
                    value={w.height}
                    onChange={(e) => {
                      const copy = [...walls]
                      copy[i].height = e.target.value
                      setWalls(copy)
                    }}
                    className="w-full p-2 rounded bg-gray-700"
                  />

                  {walls.length > 1 && (
                    <button
                      onClick={() => removeWall(i)}
                      className="text-red-400"
                    >
                      ✕
                    </button>
                  )}

                </div>
              ))}

              <button
                onClick={addWall}
                className="text-sm text-blue-400"
              >
                + Legg til vegg
              </button>

            </div>

            {/* WINDOWS */}

            <div className="bg-gray-700/40 p-3 rounded-xl mb-3">

              <h3 className="text-blue-400 mb-2">Vinduer</h3>

              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => addStandardWindow(1, 1.2)}
                  className="bg-gray-700 px-2 py-1 rounded text-sm"
                >
                  100x120
                </button>

                <button
                  onClick={() => addStandardWindow(1.2, 1.2)}
                  className="bg-gray-700 px-2 py-1 rounded text-sm"
                >
                  120x120
                </button>
              </div>

              {windows.map((w, i) => (
                <div key={i} className="flex gap-2 mb-2">

                  <input
                    placeholder="Bredde"
                    value={w.width}
                    onChange={(e) => {
                      const copy = [...windows]
                      copy[i].width = e.target.value
                      setWindows(copy)
                    }}
                    className="w-full p-2 rounded bg-gray-700"
                  />

                  <input
                    placeholder="Høyde"
                    value={w.height}
                    onChange={(e) => {
                      const copy = [...windows]
                      copy[i].height = e.target.value
                      setWindows(copy)
                    }}
                    className="w-full p-2 rounded bg-gray-700"
                  />

                  <button
                    onClick={() => removeWindow(i)}
                    className="text-red-400"
                  >
                    ✕
                  </button>

                </div>
              ))}

            </div>

            {/* DOORS */}

            <div className="bg-gray-700/40 p-3 rounded-xl mb-3">

              <h3 className="text-blue-400 mb-2">Dører</h3>

              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => addStandardDoor(0.8, 2.1)}
                  className="bg-gray-700 px-2 py-1 rounded text-sm"
                >
                  80x210
                </button>

                <button
                  onClick={() => addStandardDoor(0.9, 2.1)}
                  className="bg-gray-700 px-2 py-1 rounded text-sm"
                >
                  90x210
                </button>
              </div>

              {doors.map((d, i) => (
                <div key={i} className="flex gap-2 mb-2">

                  <input
                    placeholder="Bredde"
                    value={d.width}
                    onChange={(e) => {
                      const copy = [...doors]
                      copy[i].width = e.target.value
                      setDoors(copy)
                    }}
                    className="w-full p-2 rounded bg-gray-700"
                  />

                  <input
                    placeholder="Høyde"
                    value={d.height}
                    onChange={(e) => {
                      const copy = [...doors]
                      copy[i].height = e.target.value
                      setDoors(copy)
                    }}
                    className="w-full p-2 rounded bg-gray-700"
                  />

                  <button
                    onClick={() => removeDoor(i)}
                    className="text-red-400"
                  >
                    ✕
                  </button>

                </div>
              ))}

            </div>

            {/* COATS */}

            <input
              type="number"
              min={1}
              value={coats}
              onChange={(e) => setCoats(Number(e.target.value))}
              className="w-full p-2 rounded bg-gray-700 mb-3"
              placeholder="Antall strøk"
            />

            {/* CALCULATE */}

            <button
              onClick={calculatePaint}
              className="w-full bg-indigo-600 p-3 rounded-xl"
            >
              Beregn maling
            </button>

            {/* RESULT */}

            {liters !== null && netArea !== null && (
              <div className="bg-indigo-700 p-4 rounded-xl mt-3">

                <p className="text-sm opacity-80">Areal</p>
                <p className="font-bold">{netArea} m²</p>

                <p className="text-sm opacity-80 mt-2">Maling</p>
                <p className="font-bold text-xl">{liters} liter</p>

                <button
                  onClick={() => setShowSave(true)}
                  className="bg-green-600 w-full p-2 rounded-xl mt-3"
                >
                  Lag prosjekt
                </button>

              </div>
            )}

          </>
        )}

        {/* SAVE POPUP */}

               {showSave && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
            <div className="bg-white p-4 rounded-xl w-64 text-black">

              <h3 className="font-bold mb-2">Prosjektnavn</h3>

              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="border p-2 w-full mb-2"
                placeholder="F.eks Stue"
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
