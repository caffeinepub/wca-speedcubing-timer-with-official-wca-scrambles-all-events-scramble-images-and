import { TimerScreen } from './components/TimerScreen';
import { ThemeProvider } from 'next-themes';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TimerScreen />
    </ThemeProvider>
  );
}

export default App;
