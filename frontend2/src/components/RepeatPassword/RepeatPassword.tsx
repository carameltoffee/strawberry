import { useState, useEffect } from 'react';

interface PasswordRepeatProps {
     onChange: (password: string) => void;
}

export const PasswordRepeat: React.FC<PasswordRepeatProps> = ({ onChange }) => {
     const [password, setPassword] = useState('');
     const [repeat, setRepeat] = useState('');
     const [error, setError] = useState('');

     useEffect(() => {
          if (password && repeat && password !== repeat) {
               setError('Пароли не совпадают');
               onChange('');
          } else {
               setError('');
               if (password && repeat) {
                    onChange(password);
               }
          }
     }, [password, repeat, onChange]);

     return (
          <div style={{ width: '100%' }}>
               <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', display: 'block', marginBottom: '0.5rem' }}
                    required
               />
               <input
                    type="password"
                    placeholder="Повторите пароль"
                    value={repeat}
                    onChange={(e) => setRepeat(e.target.value)}
                    style={{ width: '100%', display: 'block' }}
                    required
               />
               {error && <div style={{ color: 'red', marginTop: '0.5rem' }}>{error}</div>}
          </div>
     );
};
