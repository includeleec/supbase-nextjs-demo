import { toast } from '../toast'

// Mock DOM methods
const mockElement = {
  className: '',
  textContent: '',
  id: '',
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
  },
  remove: jest.fn(),
  offsetHeight: 0,
}

Object.defineProperty(document, 'createElement', {
  value: jest.fn().mockReturnValue(mockElement),
})

Object.defineProperty(document.body, 'appendChild', {
  value: jest.fn(),
})

Object.defineProperty(document.body, 'removeChild', {
  value: jest.fn(),
})

Object.defineProperty(document.body, 'contains', {
  value: jest.fn().mockReturnValue(true),
})

// Mock setTimeout and clearTimeout
global.setTimeout = jest.fn((fn) => {
  fn()
  return 123
}) as any

global.clearTimeout = jest.fn()

describe('Toast Library', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mock element state
    mockElement.className = ''
    mockElement.textContent = ''
    mockElement.id = ''
    mockElement.classList.add.mockClear()
    mockElement.classList.remove.mockClear()
  })

  describe('Toast Creation', () => {
    it('should create success toast', () => {
      toast.success('成功消息')
      
      expect(document.createElement).toHaveBeenCalledWith('div')
      expect(document.body.appendChild).toHaveBeenCalled()
    })

    it('should create error toast', () => {
      toast.error('错误消息')
      
      expect(document.createElement).toHaveBeenCalledWith('div')
      expect(document.body.appendChild).toHaveBeenCalled()
    })

    it('should create warning toast', () => {
      toast.warning('警告消息')
      
      expect(document.createElement).toHaveBeenCalledWith('div')
      expect(document.body.appendChild).toHaveBeenCalled()
    })

    it('should create info toast', () => {
      toast.info('信息消息')
      
      expect(document.createElement).toHaveBeenCalledWith('div')
      expect(document.body.appendChild).toHaveBeenCalled()
    })
  })

  describe('Toast Auto-dismiss', () => {
    it('should auto-dismiss toast after duration', () => {
      toast.success('测试消息')
      
      expect(setTimeout).toHaveBeenCalled()
      expect(mockElement.classList.add).toHaveBeenCalledWith('show')
    })
  })

  describe('Toast Types', () => {
    it('should handle different toast types correctly', () => {
      const types = ['success', 'error', 'warning', 'info'] as const
      
      types.forEach(type => {
        toast[type](`${type} 消息`)
        expect(document.createElement).toHaveBeenCalled()
      })
    })
  })

  describe('Toast Message Content', () => {
    it('should set correct text content', () => {
      const message = '这是一条测试消息'
      toast.success(message)
      
      expect(mockElement.textContent).toBe(message)
    })
  })

  describe('Toast Styling', () => {
    it('should apply correct CSS classes', () => {
      toast.success('测试消息')
      
      expect(mockElement.className).toContain('toast')
      expect(mockElement.className).toContain('success')
    })
  })
})