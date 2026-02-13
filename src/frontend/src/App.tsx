import { TimerScreen } from './components/TimerScreen';
import { ThemeProvider } from 'next-themes';
import { EmailPasswordAuthProvider } from './hooks/useEmailPasswordAuth';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <EmailPasswordAuthProvider>
        <TimerScreen />
      </EmailPasswordAuthProvider>
    </ThemeProvider>
  );
}

export default App;
