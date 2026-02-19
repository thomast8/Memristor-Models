import { Header } from './components/layout/Header.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { ParameterBar } from './components/layout/ParameterBar.tsx';
import { PlotPanel } from './components/plots/PlotPanel.tsx';

export default function App() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <Header />
      <div
        style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <Sidebar />
        <main
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            overflow: 'hidden',
            position: 'relative',
            zIndex: 0,
          }}
        >
          <PlotPanel />
        </main>
      </div>
      <ParameterBar />
    </div>
  );
}
