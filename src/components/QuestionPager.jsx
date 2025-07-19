import React from 'react';

function QuestionPager({ questions, userAnswers, onAnswer, result, onSubmit }) {
  const [current, setCurrent] = React.useState(0);
  const q = questions[current];
  const total = questions.length;

  return (
    <div className="question-block" style={{
      background: "#18191c",
      borderRadius: 12,
      padding: 28,
      margin: "0 auto",
      maxWidth: 600,
      boxShadow: "0 2px 16px #0002"
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.35em', marginBottom: 18, textAlign: "center" }}>
        {current + 1}. {q.question}
      </div>
      <div className="alternatives-vertical" style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        margin: "0 auto",
        maxWidth: 500
      }}>
        {q.alternatives.map(alt => (
          <label
            key={alt.letter}
            className={userAnswers[current] === alt.letter ? 'selected' : ''}
            style={{
              background: userAnswers[current] === alt.letter ? "#23272f" : "transparent",
              borderRadius: 8,
              padding: "8px 12px",
              cursor: result ? "default" : "pointer",
              border: "1px solid #23272f"
            }}
          >
            <input
              type="radio"
              name={`q${current}`}
              value={alt.letter}
              checked={userAnswers[current] === alt.letter}
              onChange={() => onAnswer(current, alt.letter)}
              disabled={!!result}
              style={{ marginRight: 8 }}
            />
            <span style={{ fontWeight: 500 }}>{alt.letter})</span> {alt.text}
          </label>
        ))}
      </div>
      {result && (
        <div style={{ color: userAnswers[current] === q.key ? 'green' : 'red', marginTop: 12, textAlign: "center" }}>
          {userAnswers[current] === q.key
            ? 'Correcto'
            : <>Incorrecto. Respuesta: <b>{q.key}) {q.alternatives.find(a => a.letter === q.key)?.text || ''}</b></>
          }
        </div>
      )}
      <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: "center" }}>
        <button
          type="button"
          onClick={() => setCurrent(c => c - 1)}
          disabled={current === 0}
          style={{ padding: "8px 18px", borderRadius: 6 }}
        >
          Regresar
        </button>
        <button
          type="button"
          onClick={() => setCurrent(c => c + 1)}
          disabled={current === total - 1}
          style={{ padding: "8px 18px", borderRadius: 6 }}
        >
          Siguiente
        </button>
        {!result && current === total - 1 && (
          <button
            type="submit"
            style={{
              marginLeft: 'auto',
              background: "#2e8b57",
              color: "#fff",
              padding: "8px 18px",
              borderRadius: 6,
              fontWeight: 600
            }}
          >
            Finalizar examen
          </button>
        )}
      </div>
      <div style={{ marginTop: 12, fontSize: '0.95em', color: '#aaa', textAlign: "center" }}>
        Pregunta {current + 1} de {total}
      </div>
    </div>
  );
}

export default QuestionPager;
