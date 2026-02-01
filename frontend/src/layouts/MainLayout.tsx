// frontend/src/layouts/MainLayout.tsx
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div>
      <header>
        <h1>Placement Prep Platform</h1>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
