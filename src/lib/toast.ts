export type ToastType = 'success' | 'error' | 'warning' | 'info'

let toastId = 0

export function showToast(message: string, type: ToastType = 'info', duration: number = 3000) {
  const id = ++toastId
  const toast = document.createElement('div')
  toast.className = `toast ${type}`
  toast.textContent = message
  toast.id = `toast-${id}`
  
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.classList.add('show')
  }, 10)
  
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast)
      }
    }, 300)
  }, duration)
}

export const toast = {
  success: (message: string, duration?: number) => showToast(message, 'success', duration),
  error: (message: string, duration?: number) => showToast(message, 'error', duration),
  warning: (message: string, duration?: number) => showToast(message, 'warning', duration),
  info: (message: string, duration?: number) => showToast(message, 'info', duration),
}