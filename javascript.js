const campoTexto =
    document.getElementById("texto");

const campoSenha =
    document.getElementById("senha");

const campoResultado =
    document.getElementById("resultado");

const mensagem =
    document.getElementById("mensagem");


const botaoCriptografar =
    document.getElementById("criptografar");

const botaoDescriptografar =
    document.getElementById("descriptografar");

const botaoCopiar =
    document.getElementById("copiar");

const botaoMostrarSenha =
    document.getElementById("mostrarSenha");


const encoder =
    new TextEncoder();

const decoder =
    new TextDecoder();



/*
|--------------------------------------------------------------------------
| CONVERTER ARRAYBUFFER PARA BASE64
|--------------------------------------------------------------------------
*/

function arrayBufferParaBase64(buffer) {

    const bytes =
        new Uint8Array(buffer);

    let binario = "";


    for (const byte of bytes) {

        binario +=
            String.fromCharCode(byte);

    }


    return btoa(binario);

}



/*
|--------------------------------------------------------------------------
| CONVERTER BASE64 PARA ARRAYBUFFER
|--------------------------------------------------------------------------
*/

function base64ParaArrayBuffer(base64) {

    const binario =
        atob(base64);

    const bytes =
        new Uint8Array(binario.length);


    for (
        let i = 0;
        i < binario.length;
        i++
    ) {

        bytes[i] =
            binario.charCodeAt(i);

    }


    return bytes;

}



/*
|--------------------------------------------------------------------------
| GERAR CHAVE A PARTIR DA SENHA
|--------------------------------------------------------------------------
*/

async function gerarChave(
    senha,
    salt
) {

    /*
        Primeiro importamos a senha
        como material criptográfico.
    */

    const materialChave =
        await crypto.subtle.importKey(

            "raw",

            encoder.encode(senha),

            "PBKDF2",

            false,

            ["deriveKey"]

        );


    /*
        Agora transformamos a senha
        em uma chave AES de 256 bits.
    */

    return crypto.subtle.deriveKey(

        {
            name: "PBKDF2",

            salt: salt,

            iterations: 250000,

            hash: "SHA-256"
        },

        materialChave,

        {
            name: "AES-GCM",

            length: 256
        },

        false,

        [
            "encrypt",
            "decrypt"
        ]

    );

}



/*
|--------------------------------------------------------------------------
| CRIPTOGRAFAR
|--------------------------------------------------------------------------
*/

async function criptografar() {

    limparMensagem();


    const texto =
        campoTexto.value;

    const senha =
        campoSenha.value;


    if (texto.trim() === "") {

        mostrarErro(
            "Digite algum texto para criptografar."
        );

        return;

    }


    if (senha.length < 8) {

        mostrarErro(
            "Utilize uma senha com pelo menos 8 caracteres."
        );

        return;

    }


    try {

        /*
            Salt aleatório.

            Ele impede que senhas iguais
            produzam sempre a mesma chave.
        */

        const salt =
            crypto.getRandomValues(
                new Uint8Array(16)
            );


        /*
            IV aleatório.

            O AES-GCM precisa de um IV
            diferente em cada criptografia.
        */

        const iv =
            crypto.getRandomValues(
                new Uint8Array(12)
            );


        const chave =
            await gerarChave(
                senha,
                salt
            );


        const dadosCriptografados =
            await crypto.subtle.encrypt(

                {
                    name: "AES-GCM",

                    iv: iv
                },

                chave,

                encoder.encode(texto)

            );


        /*
            Criamos um objeto contendo:

            v    = versão
            salt = salt usado
            iv   = IV usado
            data = conteúdo criptografado
        */

        const pacote = {

            v: 1,

            salt:
                arrayBufferParaBase64(
                    salt
                ),

            iv:
                arrayBufferParaBase64(
                    iv
                ),

            data:
                arrayBufferParaBase64(
                    dadosCriptografados
                )

        };


        /*
            O objeto vira JSON
            e depois Base64.

            Isso facilita copiar e salvar.
        */

        campoResultado.value =
            btoa(
                unescape(
                    encodeURIComponent(
                        JSON.stringify(pacote)
                    )
                )
            );


        mostrarSucesso(
            "Texto criptografado com sucesso."
        );

    }
    catch (erro) {

        console.error(erro);


        mostrarErro(
            "Não foi possível criptografar o texto."
        );

    }

}



/*
|--------------------------------------------------------------------------
| DESCRIPTOGRAFAR
|--------------------------------------------------------------------------
*/

async function descriptografar() {

    limparMensagem();


    const textoCriptografado =
        campoTexto.value.trim();

    const senha =
        campoSenha.value;


    if (textoCriptografado === "") {

        mostrarErro(
            "Cole o conteúdo criptografado no campo Texto."
        );

        return;

    }


    if (senha === "") {

        mostrarErro(
            "Informe a senha utilizada na criptografia."
        );

        return;

    }


    try {

        /*
            Decodifica o pacote Base64.
        */

        const json =
            decodeURIComponent(
                escape(
                    atob(
                        textoCriptografado
                    )
                )
            );


        const pacote =
            JSON.parse(json);


        /*
            Validamos minimamente
            a estrutura recebida.
        */

        if (
            !pacote.salt ||
            !pacote.iv ||
            !pacote.data
        ) {

            throw new Error(
                "Formato inválido."
            );

        }


        const salt =
            base64ParaArrayBuffer(
                pacote.salt
            );


        const iv =
            base64ParaArrayBuffer(
                pacote.iv
            );


        const dados =
            base64ParaArrayBuffer(
                pacote.data
            );


        const chave =
            await gerarChave(
                senha,
                salt
            );


        const dadosDescriptografados =
            await crypto.subtle.decrypt(

                {
                    name: "AES-GCM",

                    iv: iv
                },

                chave,

                dados

            );


        campoResultado.value =
            decoder.decode(
                dadosDescriptografados
            );


        mostrarSucesso(
            "Texto descriptografado com sucesso."
        );

    }
    catch (erro) {

        console.error(erro);


        campoResultado.value = "";


        mostrarErro(
            "Não foi possível descriptografar. Verifique a senha ou o conteúdo informado."
        );

    }

}



/*
|--------------------------------------------------------------------------
| COPIAR RESULTADO
|--------------------------------------------------------------------------
*/

async function copiarResultado() {

    const resultado =
        campoResultado.value;


    if (resultado === "") {

        mostrarErro(
            "Não existe resultado para copiar."
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(
            resultado
        );


        mostrarSucesso(
            "Resultado copiado."
        );

    }
    catch {

        campoResultado.select();

        document.execCommand(
            "copy"
        );


        mostrarSucesso(
            "Resultado copiado."
        );

    }

}



/*
|--------------------------------------------------------------------------
| MOSTRAR / ESCONDER SENHA
|--------------------------------------------------------------------------
*/

function alternarSenha() {

    if (
        campoSenha.type === "password"
    ) {

        campoSenha.type =
            "text";

        botaoMostrarSenha.textContent =
            "Ocultar";

    }
    else {

        campoSenha.type =
            "password";

        botaoMostrarSenha.textContent =
            "Mostrar";

    }

}



/*
|--------------------------------------------------------------------------
| MENSAGENS
|--------------------------------------------------------------------------
*/

function mostrarErro(texto) {

    mensagem.textContent =
        texto;

    mensagem.className =
        "mensagem erro";

}


function mostrarSucesso(texto) {

    mensagem.textContent =
        texto;

    mensagem.className =
        "mensagem sucesso";

}


function limparMensagem() {

    mensagem.textContent =
        "";

    mensagem.className =
        "mensagem";

}



/*
|--------------------------------------------------------------------------
| EVENTOS
|--------------------------------------------------------------------------
*/

botaoCriptografar.addEventListener(
    "click",
    criptografar
);


botaoDescriptografar.addEventListener(
    "click",
    descriptografar
);


botaoCopiar.addEventListener(
    "click",
    copiarResultado
);


botaoMostrarSenha.addEventListener(
    "click",
    alternarSenha
);