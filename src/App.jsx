import React, { useState } from 'react';
import './App.css';
import QuestionPager from './components/QuestionPager';

function parseQuestions(text) {
  // Divide por número de pregunta
  const questionBlocks = text.split(/\n(?=\d+\.)/).map(q => q.trim()).filter(Boolean);
  return questionBlocks.map(block => {
    const [qLine, ...altLines] = block.split(/\n/);
    const question = qLine.replace(/^\d+\.\s*/, '');
    const alternatives = altLines
      .map(line => line.match(/^([a-eA-E])\)\s*(.*)$/))
      .filter(Boolean)
      .map(([, letter, text]) => ({ letter: letter.toLowerCase(), text: text.trim() }));
    return { question, alternatives };
  });
}

function parseKeys(text, numQuestions) {
  // Ejemplo: 1-b, 2-c, 3-a
  const keysArr = Array(numQuestions).fill({ key: '' });
  text.split(',').forEach(pair => {
    const [num, key] = pair.trim().split('-');
    const idx = parseInt(num, 10) - 1;
    if (!isNaN(idx) && key) {
      keysArr[idx] = { key: key.toLowerCase() };
    }
  });
  return keysArr;
}

function saveExam(exam) {
  const exams = JSON.parse(localStorage.getItem('exams') || '[]');
  exams.push(exam);
  localStorage.setItem('exams', JSON.stringify(exams));
}

function App() {
  const [view, setView] = useState('home');
  const [examName, setExamName] = useState('');
  const [questionsText, setQuestionsText] = useState('');
  const [keysText, setKeysText] = useState('');
  const [exams, setExams] = useState(JSON.parse(localStorage.getItem('exams') || '[]'));
  const [selectedExam, setSelectedExam] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const handleCreateExam = () => {
    const questions = parseQuestions(questionsText);
    const keys = parseKeys(keysText, questions.length);
    const valid = questions.length > 0 && keys.length === questions.length && keys.every(k => k.key);
    if (!valid) {
      return alert('Verifica que las preguntas y claves estén en el formato correcto.');
    }
    const exam = { name: examName, questions, keys };
    saveExam(exam);
    setExams(prev => [...prev, exam]);
    setView('list');
  };

  const handleSelectExam = (exam) => {
    setSelectedExam(exam);
    setUserAnswers(Array(exam.questions.length).fill(''));
    setResult(null);
    setView('take');
  };

  const handleAnswer = (questionIndex, answer) => {
    setUserAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = answer;
      return newAnswers;
    });
  };

  const handleSubmit = () => {
    if (result) return;
    if (!selectedExam) return;
    const correct = userAnswers.filter((ans, i) => ans === selectedExam.keys[i]?.key).length;
    setResult({ total: selectedExam.questions.length, correct });
  };

  // Eliminar examen
  const handleDeleteExam = (idx) => {
    if (!window.confirm('¿Seguro que deseas eliminar este examen?')) return;
    const newExams = exams.filter((_, i) => i !== idx);
    setExams(newExams);
    localStorage.setItem('exams', JSON.stringify(newExams));
  };

  // // Editar examen (cargar datos en el formulario y cambiar a vista home)
  // const handleEditExam = (idx) => {
  //   const exam = exams[idx];
  //   if (!exam) {
  //     alert('No se encontró el examen para editar.');
  //     return;
  //   }
  //   // Primero cargar los datos
  //   setExamName(exam.name);
  //   setQuestionsText(
  //     exam.questions.map((q, i) => {
  //       const alts = q.alternatives.map(a => `${a.letter}) ${a.text}`).join('\n');
  //       return `${i + 1}. ${q.question}\n${alts}`;
  //     }).join('\n')
  //   );
  //   setKeysText(exam.keys.map((k, i) => `${i + 1}-${k.key}`).join(', '));
  //   setView('home');
  //   // Luego eliminar el examen viejo para que al guardar no se duplique
  //   setTimeout(() => handleDeleteExam(idx), 0);
  // };

  // Exportar exámenes
const handleExport = () => {
  const dataStr = JSON.stringify(exams, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "examenes.json";
  a.click();
  URL.revokeObjectURL(url);
};

// Importar exámenes
const handleImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      setExams(imported);
      localStorage.setItem('exams', JSON.stringify(imported));
      alert("Exámenes importados correctamente.");
    } catch {
      alert("Archivo inválido.");
    }
  };
  reader.readAsText(file);
};

  return (
    <div className="container">
      <h1>Gestor de Exámenes</h1>
      <nav style={{ marginBottom: 20 }}>
        <button onClick={() => setView('home')}>Crear examen</button>
        <button onClick={() => setView('list')}>Lista de exámenes</button>
      </nav>

      {view === 'home' && (
        <div className="form-section">
          <h2>Nuevo examen</h2>
          <input
            type="text"
            placeholder="Nombre del examen"
            value={examName}
            onChange={e => setExamName(e.target.value)}
            style={{ width: '100%', marginBottom: 8 }}
          />
          <textarea
            rows={8}
            placeholder={`Pega aquí las preguntas con alternativas\nEjemplo:\n1. ¿Qué es Big Data?\na) ...\nb) ...\nc) ...`}
            value={questionsText}
            onChange={e => setQuestionsText(e.target.value)}
            style={{ width: '100%', marginBottom: 8 }}
          />
          <textarea
            rows={2}
            placeholder="Claves (ej: 1-b, 2-c, 3-a)"
            value={keysText}
            onChange={e => setKeysText(e.target.value)}
            style={{ width: '100%', marginBottom: 8 }}
          />
          <button onClick={handleCreateExam}>Guardar examen</button>
        </div>
      )}

      {view === 'list' && (
        <div className="list-section">
          <h2>Exámenes guardados</h2>
          <div style={{ marginBottom: 18, display: 'flex', gap: 12 }}>
            {exams.length > 0 && (
              <button onClick={handleExport}>Exportar exámenes</button>
            )}
            <input type="file" accept="application/json" onChange={handleImport} />
          </div>
          <div style={{display:'flex', flexWrap:'wrap', gap: '1.5em 1em'}}>
            {exams.length === 0 && <div>No hay exámenes guardados.</div>}
            {exams.map((exam, idx) => (
              <div key={idx} style={{
                background:'#23242a',
                borderRadius:10,
                boxShadow:'0 1px 8px #0004',
                padding:'1.2em 1em',
                minWidth:220,
                maxWidth:260,
                display:'flex',
                flexDirection:'column',
                alignItems:'flex-start',
                gap:10,
                position:'relative'
              }}>
                <div style={{fontWeight:600, fontSize:'1.1em', marginBottom:6, color:'#fff'}}>{exam.name}</div>
                <div style={{display:'flex', gap:8}}>
                  <button onClick={() => handleSelectExam(exam)} style={{background:'#646cff', color:'#fff'}}>Rendir</button>
                  {/* <button onClick={() => handleEditExam(idx)} style={{background:'#ffa500', color:'#222'}}>Editar</button> */}
                  <button onClick={() => handleDeleteExam(idx)} style={{background:'#b22222', color:'#fff'}}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {view === 'take' && selectedExam && (
        <div className="exam-section">
          <h2>{selectedExam.name}</h2>
          {!result ? (
            <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
              <QuestionPager
                questions={selectedExam.questions}
                userAnswers={userAnswers}
                onAnswer={handleAnswer}
                result={result}
                onSubmit={handleSubmit}
              />
            </form>
          ) : (
            <div>
              {selectedExam.questions.map((q, idx) => {
                const userAns = userAnswers[idx];
                const correctKey = selectedExam.keys[idx]?.key;
                return (
                  <div className="question-block" key={idx} style={{marginBottom: 24}}>
                    <div style={{fontWeight:'bold', fontSize:'1.15em', marginBottom:8}}>
                      {idx + 1}. {q.question}
                    </div>
                    <div className="alternatives-vertical" style={{display:'flex', flexDirection:'column', gap:10}}>
                      {q.alternatives.map(alt => {
                        let style = {};
                        if (alt.letter === correctKey) style = {background:'#2e8b57', color:'#fff', fontWeight:600};
                        if (userAns === alt.letter && userAns !== correctKey) style = {background:'#b22222', color:'#fff', fontWeight:600};
                        return (
                          <div key={alt.letter} style={{...style, borderRadius:6, padding:'6px 12px'}}>
                            <span style={{fontWeight:500}}>{alt.letter})</span> {alt.text}
                            {alt.letter === correctKey && <span style={{marginLeft:8, fontWeight:700}}>(Correcta)</span>}
                            {userAns === alt.letter && userAns !== correctKey && <span style={{marginLeft:8, fontWeight:700}}>(Tu respuesta)</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: 20 }}>
                <b>Resultado: {result.correct} de {result.total} correctas</b>
                <br />
                <button type="button" onClick={() => setView('list')}>Volver a la lista</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;


