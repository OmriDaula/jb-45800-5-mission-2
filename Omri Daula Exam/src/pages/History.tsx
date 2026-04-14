import { useHistory } from '../context/HistoryContext';
import { HistoryTable } from '../components/HistoryTable';
import './History.css';

export function History() {
  const { history } = useHistory();

  return (
    <div className="history-page">
      <h1 className="page-title">Search History</h1>
      <p className="page-subtitle">Your past weather searches</p>
      <HistoryTable history={history} />
    </div>
  );
}
