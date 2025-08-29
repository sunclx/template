import { invoke } from '@tauri-apps/api/core'

export async function paste(_text: string) {
    invoke('paste').then((res) => {
        console.log("paste", res)
    }).catch((err) => {
        console.log(err)
    })
}
