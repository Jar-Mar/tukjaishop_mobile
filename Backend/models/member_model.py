from pydantic import BaseModel
from typing import List, Optional


class Member(BaseModel):
    name: str
    phone: str
    points: Optional[int] = 0
