import React, {useRef, useState} from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {useDropzone} from 'react-dropzone';

import styles from './MailComposer.module.css';

export default function MailComposer() {
    const [html, setHtml] = useState('');
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const quillRef = useRef<ReactQuill | null>(null);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop: (acceptedFiles) => setFiles((prev) => [...prev, ...acceptedFiles])
    });

    const handleSend = () => {
        console.log({to, subject, html, files});
        alert('Письмо отправлено (лог в консоль)');
        setHtml('');
        setTo('');
        setSubject('');
        setFiles([]);
    };

    return (
        <div className={styles.mailComposer}>
            <input
                type="text"
                placeholder="Кому"
                className={styles.mailInput}
                value={to}
                onChange={(e) => setTo(e.target.value)}
            />
            <input
                type="text"
                placeholder="Тема"
                className={styles.mailInput}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
            />

            <ReactQuill
                className={styles.quillEditor}

                ref={quillRef}
                value={html}
                onChange={setHtml}
                theme="snow"
                placeholder="Напишите что-нибудь"
                modules={{
                    toolbar: [
                        [{font: []}],
                        [{size: []}],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{color: []}, {background: []}],
                        [{list: 'ordered'}, {list: 'bullet'}],
                        [{align: []}],
                        ['link', 'image'],
                        ['blockquote', 'code-block'],
                        ['clean'],
                    ],
                }}
                formats={[
                    'font', 'size', 'bold', 'italic', 'underline', 'strike',
                    'color', 'background', 'list', 'bullet',
                    'align', 'link', 'image', 'blockquote', 'code-block',
                ]}
            />

            <div
                {...getRootProps()}
                className={styles.dropzone}
                style={{
                    backgroundColor: isDragActive ? '#eef' : undefined
                }}
            >
                <input {...getInputProps()} />
                {isDragActive
                    ? <p>Отпустите файлы, чтобы прикрепить</p>
                    : <p>Перетащите файлы сюда или нажмите для выбора</p>}
            </div>

            {files.length > 0 && (
                <ul className={styles.fileList}>
                    {files.map((file, i) => (
                        <li key={i}>
                            {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </li>
                    ))}
                </ul>
            )}

            <div className={styles.bottomBar}>
                <button className={styles.sendButton} onClick={handleSend} disabled={!html && files.length === 0}>
                    Отправить
                </button>
                <div className={styles.actions}>
                    <span title="Прикрепить файл">📎</span>
                    <span title="Вставить изображение">🖼️</span>
                    <span title="Другие действия">⋯</span>
                </div>
            </div>
        </div>
    );
}
