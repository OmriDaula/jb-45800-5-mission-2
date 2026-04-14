import type { HistoryEntry } from '../types';
import './HistoryTable.css';

interface HistoryTableProps {
  history: HistoryEntry[];
}

export function HistoryTable({ history }: HistoryTableProps) {
  if (history.length === 0) {
    return (
      <div className="no-history">
        <span className="no-history-icon">&#128269;</span>
        No searches yet
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="history-table">
        <thead>
          <tr>
            <th>Search Time</th>
            <th>City</th>
            <th>Country</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry, idx) => (
            <tr key={idx}>
              <td>{entry.datetime}</td>
              <td>{entry.city}</td>
              <td>{entry.country}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
