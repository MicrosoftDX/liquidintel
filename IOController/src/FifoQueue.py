
class _FifoItem(object):
    def __init__(self, previousItem, nextItem, data):
        self.previousItem = previousItem
        self.nextItem = nextItem
        self.peekCount = 0
        self.data = data

# Doubly-linked list implementation of a FIFO queue
class Fifo(object): 
    def __init__(self): 
        self._first = None
        self._last = None

    def enqueue(self, data): 
        if self._last:
            current = self._last
            self._last = _FifoItem(self._last, None, data)
            current.nextItem = self._last
        else:
            self._last = _FifoItem(None, None, data)
            self._first = self._last

    def dequeue(self): 
        if not self._first:
            return None
        item = self._first
        self._first = item.nextItem
        if not self._first:
            self._last = None
        else:
            self._first.previousItem = None
        return item.data

    def peek(self):
        # We have a slightly varied semantic to peeking - it is a counted operation (therefore we break the 'no side-effects' semantic)
        # The semantic is that you peek for an item, attempt to perform an operation, if succeed then dequeue, otherwise retry for a
        # certain number of times. The counting is built into the peeking.
        if self._first:
            self._first.peekCount += 1
            return self._first.data
        return None
    
    @property
    def peekAttempts(self):
        if self._first:
            return self._first.peekCount
        return 0

    @property
    def isEmpty(self):
        return self._first == None

