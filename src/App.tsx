import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Future routes */}
        {/* <Route path="/import" element={<ImportData />} /> */}
        {/* <Route path="/students" element={<StudentsManagement />} /> */}
        {/* <Route path="/preferences" element={<PreferencesManagement />} /> */}
        {/* <Route path="/constraints" element={<ConstraintsManagement />} /> */}
        {/* <Route path="/configuration" element={<Configuration />} /> */}
        {/* <Route path="/optimization" element={<Optimization />} /> */}
        {/* <Route path="/distribution/:id" element={<Distribution />} /> */}
        {/* <Route path="/reports" element={<Reports />} /> */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
