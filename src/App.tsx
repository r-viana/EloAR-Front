import { Routes, Route } from 'react-router-dom';
import { Header, Sidebar, Navigation } from './components/layout';
import Dashboard from './pages/Dashboard';
import { ImportData } from './pages/ImportData';
import { StudentsManagement } from './pages/StudentsManagement';
import { StudentPreferences } from './pages/StudentPreferences';
import { ConstraintsManagement } from './pages/ConstraintsManagement';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/import" element={<ImportData />} />
            <Route path="/students" element={<StudentsManagement />} />
            <Route path="/preferences" element={<StudentPreferences />} />
            <Route path="/constraints" element={<ConstraintsManagement />} />

            {/* Future routes */}
            {/* <Route path="/configuration" element={<Configuration />} /> */}
            {/* <Route path="/optimization" element={<Optimization />} /> */}
            {/* <Route path="/distribution/:id" element={<Distribution />} /> */}
            {/* <Route path="/reports" element={<Reports />} /> */}

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Navigation */}
      <Navigation />
    </div>
  );
}

export default App;
