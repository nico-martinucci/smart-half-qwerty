import { useState, useEffect } from 'react';
import Hunspell from 'hunspell-spellchecker';
import { Button, ButtonGroup, Stack, TextField, Typography } from '@mui/material';

const halfQwertyMapping: Record<string, string> = {
  p: 'q',
  o: 'w',
  i: 'e',
  u: 'r',
  y: 't',
  ';': 'a',
  l: 's',
  k: 'd',
  j: 'f',
  h: 'g',
  '/': 'z',
  '.': 'x',
  ',': 'c',
  m: 'v',
  n: 'b',
  q: 'q',
  w: 'w',
  e: 'e',
  r: 'r',
  t: 't',
  a: 'a',
  s: 's',
  d: 'd',
  f: 'f',
  g: 'g',
  z: 'z',
  x: 'x',
  c: 'c',
  v: 'v',
  b: 'b',
}

function MyComponent() {
  const [text, setText] = useState('');
  const [hunspell, setHunspell] = useState<Hunspell | null>(null);
  const [decodingWordIndex, setDecodingWordIndex] = useState<number>()
  const [correctionOptions, setCorrectionOptions]= useState<string[]>()
  const [output, setOutput] = useState<string[]>([])
  const [badWord, setBadWord] = useState<string>()
  const [replaceWord, setReplaceWord] = useState<string>("")


  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const affResponse = await fetch('/index.aff');
        const dicResponse = await fetch('/index.dic');

        if (!affResponse.ok || !dicResponse.ok) {
          throw new Error('Failed to load dictionary files');
        }

        const affText = await affResponse.text();
        const dicText = await dicResponse.text();

        const spellChecker = new Hunspell();

        // @ts-expect-error bad typing
        spellChecker.dictionary = spellChecker.parse({ aff: affText, dic: dicText });

        setHunspell(spellChecker);
      } catch (error) {
        console.error('Error loading dictionary:', error);
      }
    };

    loadDictionary();
  }, []);

  useEffect(() => {
    if (!hunspell) {
      console.error('Spell checker not initialized');
      return;
    }

    if (!decodingWordIndex && decodingWordIndex !== 0) {
      return
    }

    const words = text.split(' ');

    if (decodingWordIndex > words.length - 1) {
      setDecodingWordIndex(undefined)
      setCorrectionOptions(undefined)
      return
    }

    let possibleWords: string[] = []

    words[decodingWordIndex].split('').forEach((letter, idx) => {
      if (idx === 0) {
        possibleWords.push(letter, halfQwertyMapping[letter])
        
        return
      }

      possibleWords = [...possibleWords, ...possibleWords]

      for (let i = 0; i < possibleWords.length; i++) {
        possibleWords[i] = i < possibleWords.length / 2 ? possibleWords[i] + letter : possibleWords[i] + halfQwertyMapping[letter]

      }
      
    })
    const correctWords = [...new Set(possibleWords.filter((word) => hunspell.check(word)))];

    if (correctWords.length === 1) {
      setOutput(curr => [...curr, correctWords[0]])
      setDecodingWordIndex(curr => (curr as number) + 1)
    } else if (correctWords.length) {
      setCorrectionOptions(correctWords)
    } else {
      setBadWord(words[decodingWordIndex])
    }
  }, [decodingWordIndex, hunspell])

  return (
    <Stack spacing={2} alignItems="center">
      <TextField value={text} onChange={e => setText(e.target.value)} sx={{width: 500}}/>
      <Button onClick={() => {
              setOutput([])

        setDecodingWordIndex(0)
        }}>Decode</Button>
      {!!output.length && <Typography>{output.join(" ")}</Typography>}
      <ButtonGroup>
      {correctionOptions?.map((word, idx) => <Button key={idx} onClick={() => {
        setOutput(curr => [...curr, word])
                setDecodingWordIndex(curr => (curr as number) + 1)

        }}>{word}</Button>)}
        {badWord && <>
          <Typography>{`can't find match for: ${badWord}`}</Typography>
          <TextField value={replaceWord} onChange={e => setReplaceWord(e.target.value)}/>
          <Button onClick={() => {
            setBadWord(undefined)
            setOutput(curr => [...curr, replaceWord])
            setReplaceWord("")
            setDecodingWordIndex(curr => (curr as number) + 1)

          }}>Next</Button>
        </>}
      </ButtonGroup>
    </Stack>
  );
}

export default MyComponent;
