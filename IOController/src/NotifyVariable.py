
class NotifyVariable(object):
    def __init__(self, value=None):
        self._value = value
        self._handlers = []

    def __iadd__(self, handler):
        self._handlers.append(handler)
        return self

    def __isub__(self, handler):
        self._handlers.remove(handler)
        return self

    @property
    def value(self):
        return self._value

    @value.setter
    def value(self, newValue):
        if self._value != newValue:
            self._value = newValue
            for handler in self._handlers:
                handler(self)
            
