type RotationDirection = "left" | "right";
type Orientation = 0 | 90 | 180 | 270;

interface Card {
  id: number;
  type: string;
  type_arg: number;
  location: string;
  location_arg: number;
}

interface RoomCard extends Card {
  fire_level: number;
  orientation: Orientation;
}

class Room implements RoomCard {
  id: number;
  type: string;
  type_arg: number;
  location: string;
  location_arg: number;
  fire_level: number;
  orientation: Orientation;

  private element: HTMLDivElement;

  public constructor(card: RoomCard) {
    Object.assign(this, card);
    this.element = document.createElement("div");
    this.element.id = String(this.id);
    this.updateStyle();
  }

  public rotate(direction: RotationDirection): void {
    const orientations: Orientation[] = [0, 90, 180, 270];
    const currentIndex = orientations.indexOf(this.orientation);

    let newIndex;
    if (direction === "right") {
      newIndex = (currentIndex + 1) % orientations.length;
    } else {
      newIndex = (currentIndex - 1 + orientations.length) % orientations.length;
    }

    this.orientation = orientations[newIndex];
    this.updateStyle();
  }

  public updateStyle(): void {
    this.element.style.setProperty("--orientation", String(this.orientation));
    this.element.style.setProperty("--fire", String(this.fire_level));
  }
}
