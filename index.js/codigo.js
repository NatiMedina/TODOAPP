async function Post(URL, body) {
    let response = await RequestWithBody(URL, 'POST', body);
    if (response.ok) {
        return await response.json()
    } else {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}
async function Put(URL, body) {
    let response = await RequestWithBody(URL, 'PUT', body);
    if (response.ok) {
        return await response.json()
    } else {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}

async function Delete(URL) {
    let response = await RequestWithOutBody(URL, 'DELETE');
    if (response.ok) {
        return await response.json()
    } else {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}

async function Get(URL) {
    let response = await RequestWithOutBody(URL, 'GET');
    if (response.ok) {
        return await response.json()
    } else {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}

async function RequestWithBody(URL, method, body) {
    return fetch(URL, {
        method: method,
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(body)
    })
}

async function RequestWithOutBody(URL, method) {
    return fetch(URL, {
        method: method,
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    })
}

const BASE_URL = 'https://jsonbox.io/box_80aefbd79a5ee4c85054/todos';

function deleteElementTODO(element, todo) {
    Delete(BASE_URL + '/' + todo._id)
        .then(function (response) {
            console.log(response)
            console.log("Elimine", todo);
            element.remove();
        })
        .catch(function (err) {
            console.log(err);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    const modalTitle = document.getElementById('exampleModalLabel');
    const titulo = document.getElementById('exampleFormControlInput1');
    const cuerpo = document.getElementById('exampleFormControlTextarea1');
    const botonCrearTodo = document.getElementById("btn-createTodo");
    const botonGuardar = document.getElementById('guardar');
    const elementListaTodo = document.getElementById('listaTodo');
    const botonBuscar = document.getElementById('buscar');
    const palabraClave = document.getElementById('palabraClave');
    const todoInput = {};
    let isUpdate = false;
    let currentTitle = null;
    let currentDescription = null;

    Get(BASE_URL).then(function (todos) {
        todos.reverse().forEach(todo => {
            createElementTODO(elementListaTodo, todo);
        });

    })
        .catch(function (err) {
            console.log(err);
        });


    function createElementTODO(parentElement, todo) {

        const groupList = document.createElement('div');
        groupList.className = 'list-group-item list-group-item-action mb-3 shadow-lg';

        const elementDiv = document.createElement('div');
        elementDiv.className = 'd-flex w-100 justify-content-between';

        groupList.append(elementDiv);

        const title = document.createElement('h5');
        title.className = 'mb-1';
        title.innerText = todo.title;
        elementDiv.append(title);

        const parrafo = document.createElement('div');
        const pElement = document.createElement('p');
        pElement.className = "mb-1 d-flex w-100 justify-content-between";
        pElement.innerText = todo.description;
        parrafo.appendChild(pElement);

        const divBotones = document.createElement('div');
        divBotones.className = "d-grid gap-2 d-md-flex justify-content-md-end";

        const buttonEditar = document.createElement('button');
        buttonEditar.className = "btn btn-outline-warning me-md-2";
        buttonEditar.setAttribute('data-bs-toggle', "modal");
        buttonEditar.setAttribute('data-bs-target', "#exampleModal");
        const iEditar = document.createElement('i');
        iEditar.className = "fas fa-edit";
        buttonEditar.addEventListener('click', function () {
            modalTitle.innerText = "Modificar nota";
            titulo.value = todo.title;
            cuerpo.value = todo.description;
            todoInput._id = todo._id;

            isUpdate = true
            currentTitle = title
            currentDescription = pElement

        });
        buttonEditar.append(iEditar);
        buttonEditar.append(" Editar");

        const buttonEliminar = document.createElement('button');
        buttonEliminar.className = "btn btn-danger";
        buttonEliminar.addEventListener('click', function () {
            deleteElementTODO(groupList, todo);
        });

        const iEliminar = document.createElement('i');
        iEliminar.className = "far fa-times-circle";
        buttonEliminar.append(iEliminar);
        buttonEliminar.append(" Eliminar");

        divBotones.appendChild(buttonEditar);
        divBotones.appendChild(buttonEliminar);
        elementDiv.appendChild(divBotones);


        groupList.append(parrafo);

        parentElement.prepend(groupList);
    }

    function addTodo() {

        if (titulo.value === '' || cuerpo.value === '') {
            return;
        }

        todoInput._id = null;
        todoInput.title = titulo.value;
        todoInput.description = cuerpo.value;

        Post(BASE_URL, todoInput)
            .then(function (todo) {

                titulo.value = '';
                cuerpo.value = '';

                createElementTODO(elementListaTodo, todo);

            })
            .catch(function (err) {
                console.log(err);
            });
    }

    function updateTodo() {
        if (titulo.value === '' || cuerpo.value === '') {
            return;
        }

        const todoEditado = {
            title: titulo.value,
            description: cuerpo.value
        };
        console.log(todoInput, todoEditado);

        Put(BASE_URL + '/' + todoInput._id, todoEditado)
            .then(function (response) {
                currentTitle.innerText = todoEditado.title;
                currentDescription.innerText = todoEditado.description;
                //todoInput = {};
            })
            .catch(function (err) {
                console.log(err);
            });
    }


    function buscarTodo(palabraBuscada) {

        if (palabraBuscada === '') {
            return;
        }

        const dictSearchWords = {};
        let todosSearched = [];

        Get(BASE_URL + '?q=title:*' + palabraBuscada + '*')
            .then(function (todos) {
                todos.reverse().forEach((todo) => { dictSearchWords[todo._id] = todo; todosSearched.push(todo) });

                Get(BASE_URL + '?q=description:*' + palabraBuscada + '*')
                    .then(function (todos) {


                        todos.reverse().forEach(todo => {
                            if (!dictSearchWords[todo._id]) {
                                dictSearchWords[todo._id] = todo;
                                todosSearched.push(todo)
                            }
                        });

                        while (elementListaTodo.hasChildNodes()) {
                            elementListaTodo.removeChild(elementListaTodo.firstChild);
                        }

                        todosSearched.forEach(element => {
                            createElementTODO(elementListaTodo, element);
                        });
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            }).catch(function (err) {
                console.log(err);
            });
    }

    botonBuscar.addEventListener('click', function () {
        buscarTodo(palabraClave.value);
    });

    botonCrearTodo.addEventListener('click', function () {
        modalTitle.innerText = "Nueva nota";
        isUpdate = false;
        titulo.value = '';
        cuerpo.value = '';
    })

    function guardar() {
        if (!isUpdate) {
            addTodo();
        } else {
            updateTodo();
        }
    }

    botonGuardar.onclick = guardar;

});
