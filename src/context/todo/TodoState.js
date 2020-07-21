import React, { useReducer, useContext } from 'react'
import { Alert } from "react-native"
import { TodoContext } from './todoContex'
import { todoReducer } from './todoReducer'
import {
    ADD_TODO,
    UPDATE_TODO,
    REMOVE_TODO,
    SHOW_LOADER,
    HIDE_LOADER,
    SHOW_ERROR,
    CLEAR_ERROR,
    FETCH_TODOS
} from '../types'
import { ScreenContext } from '../screen/screenContext'
import { Http } from '../../http'


export const TodoState = ({ children }) => {
    const initialState = {
        todos: [],
        loading: false,
        error: null
    }

    const { changeScreen } = useContext(ScreenContext)

    const [state, dispatch] = useReducer(todoReducer, initialState)

    const addTodo = async title => {

        // const response = await fetch('https://podcast-app-7d188.firebaseio.com/todos.json', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ title })
        // })
        // const data = await response.json()

        clearError()
        try {
            const data = await Http.post('https://podcast-app-7d188.firebaseio.com/todos.json',
                { title }
            )
            dispatch({ type: ADD_TODO, title, id: data.name })
        } catch (e) {
            showError('Что-то пошло не так...')
        }
    }

    const removeTodo = id => {
        const todo = state.todos.find(t => t.id === id)
        Alert.alert(
            'Удаление элемента',
            `Вы уверены, что хотите удалить "${todo.title}"?`,
            [
                {
                    text: 'Отмена',
                    style: 'cancel'
                },
                {
                    text: 'Удалить', onPress: async () => {
                        changeScreen(null)
                        await Http.delete(`https://podcast-app-7d188.firebaseio.com/todos/${id}.json`)
                        // await fetch(`https://podcast-app-7d188.firebaseio.com/todos/${id}.json`, {
                        //     method: "DELETE",
                        //     headers: { 'Content-Type': 'application/json' }
                        // })
                        dispatch({ type: REMOVE_TODO, id })
                    }
                }
            ],
            { cancelable: false }
        )
    }

    const fetchTodos = async () => {
        showLoader()
        clearError()
        try {
            // const response = await fetch(
            //     'https://podcast-app-7d188.firebaseio.com/todos.json',
            //     {
            //         method: 'GET',
            //         headers: { 'Content-Type': 'application/json' }
            //     }
            // )
            // const data = await response.json()

            const data = await Http.get('https://podcast-app-7d188.firebaseio.com/todos.json')
            const todos = Object.keys(data).map(key => {
                return { ...data[key], id: key }
            })
            dispatch({ type: FETCH_TODOS, todos })
        } catch (e) {
            showError('Что-то пошло не так...')
            console.log(e)
        } finally {
            hideLoader()
        }
    }

    const updateTodo = async (id, title) => {
        clearError()
        try {
            await fetch(`https://podcast-app-7d188.firebaseio.com/todos/${id}.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
            })
            await Http.patch(`https://podcast-app-7d188.firebaseio.com/todos/${id}.json`,
                { title }
            )
            dispatch({ type: UPDATE_TODO, id, title })
        } catch (e) {
            showError('Что-то пошло не так...')
            console.log(e)
        }
    }

    const showLoader = () => dispatch({ type: SHOW_LOADER })

    const hideLoader = () => dispatch({ type: HIDE_LOADER })

    const showError = error => dispatch({ type: SHOW_ERROR, error })

    const clearError = () => dispatch({ type: CLEAR_ERROR })



    return (
        <TodoContext.Provider
            value={{
                todos: state.todos,
                loading: state.loading,
                error: state.error,
                addTodo,
                removeTodo,
                updateTodo,
                fetchTodos
            }}>
            {children}
        </TodoContext.Provider>
    )
}