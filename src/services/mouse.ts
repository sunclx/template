import { invoke } from '@tauri-apps/api/core';

interface MousePosition {
    clientX: number;
    clientY: number;
}

export async function getMousePosition(): Promise<MousePosition | null> {
    const position = await invoke<MousePosition | null>('get_mouse_position');
    if (position) {
        return position;
    }
    return null;
}