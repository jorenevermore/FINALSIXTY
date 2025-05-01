import React, { useState } from 'react';
import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';

interface Todo {
  id: string;
  text: string;
  timestamp: Timestamp | Date;
}

const TodoList: React.FC = () => {
  const [newTodo, setNewTodo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Use react-firebase-hooks for Firestore
  const todosQuery = query(collection(db, 'todos'), orderBy('timestamp', 'desc'));
  const [todosSnapshot, loading, collectionError] = useCollection(todosQuery);

  // Convert the snapshot to our Todo interface
  const todos: Todo[] = todosSnapshot?.docs.map(doc => ({
    id: doc.id,
    text: doc.data().text,
    timestamp: doc.data().timestamp
  })) || [];

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTodo.trim()) return;
    setIsAdding(true);

    try {
      await addDoc(collection(db, 'todos'), {
        text: newTodo.trim(),
        timestamp: serverTimestamp()
      });

      setNewTodo('');
    } catch (error) {
      console.error('Error adding todo:', error);
      setError((error as Error).message);
    } finally {
      setIsAdding(false);
    }
  };

  const deleteTodo = async (id: string) => {
    setIsDeleting(id);

    try {
      await deleteDoc(doc(db, 'todos', id));
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError((error as Error).message);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Todo List</h2>

      {collectionError && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
          <p className="text-sm">
            <strong>Error:</strong> {collectionError.message}
          </p>
        </div>
      )}

      <form onSubmit={addTodo} className="mb-6">
        <div className="flex">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isAdding}
          />
          <button
            type="submit"
            disabled={isAdding}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-r hover:bg-indigo-700 transition-colors ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <div className="text-center py-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading todos...</p>
        </div>
      ) : todos.length === 0 ? (
        <p className="text-gray-500">No todos yet. Add one above!</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded"
            >
              <span>{todo.text}</span>
              <button
                onClick={() => deleteTodo(todo.id)}
                disabled={isDeleting === todo.id}
                className={`text-red-500 hover:text-red-700 ${isDeleting === todo.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isDeleting === todo.id ? 'Deleting...' : 'Delete'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TodoList;
