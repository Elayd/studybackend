interface SizePricing {
  width: number;
  height: number;
  depth: number;
  maxWeight: number;
  sizeCoef: number;
  weightCoef: number;
}

export class DeliveryCostCalculator {
  private readonly baseCost = 500;
  private readonly sizePricing: SizePricing[] = [
    { width: 34, height: 27, depth: 2, maxWeight: 0.5, sizeCoef: 1.05, weightCoef: 1.1 },
    { width: 17, height: 12, depth: 9, maxWeight: 0.5, sizeCoef: 1.1, weightCoef: 1.15 },
    { width: 23, height: 19, depth: 10, maxWeight: 2, sizeCoef: 1.2, weightCoef: 1.25 },
    { width: 33, height: 25, depth: 25, maxWeight: 5, sizeCoef: 1.3, weightCoef: 1.35 },
    { width: 60, height: 35, depth: 30, maxWeight: 18, sizeCoef: 1.4, weightCoef: 1.45 },
    { width: 60, height: 60, depth: 30, maxWeight: 20, sizeCoef: 1.5, weightCoef: 1.55 }
  ];

  private interpolate(coef1: number, coef2: number, value1: number, value2: number, value: number): number {
    const ratio = (value - value1) / (value2 - value1);
    return coef1 + ratio * (coef2 - coef1);
  }

  private calculateStrictSizeCoef(width: number, height: number, depth: number, weight: number): number {
    const size = this.sizePricing.find(
      (size) => width === size.width && height === size.height && depth === size.depth && weight <= size.maxWeight
    );

    if (!size) {
      throw new Error('Ошибка');
    }
    return size.sizeCoef * size.weightCoef;
  }

  private calculateInterpolatedSizeCoef(width: number, height: number, depth: number, weight: number): number {
    let lowerSize: SizePricing | null = null;
    let upperSize: SizePricing | null = null;

    for (let i = 0; i < this.sizePricing.length - 1; i++) {
      const currentSize = this.sizePricing[i];
      const nextSize = this.sizePricing[i + 1];

      if (
        width >= currentSize.width &&
        width <= nextSize.width &&
        height >= currentSize.height &&
        height <= nextSize.height &&
        depth >= currentSize.depth &&
        depth <= nextSize.depth &&
        weight >= currentSize.maxWeight &&
        weight <= nextSize.maxWeight
      ) {
        lowerSize = currentSize;
        upperSize = nextSize;
        break;
      }
    }

    if (lowerSize && upperSize) {
      const sizeCoef = this.interpolate(
        lowerSize.sizeCoef,
        upperSize.sizeCoef,
        lowerSize.width,
        upperSize.width,
        width
      );

      const weightCoef = this.interpolate(
        lowerSize.weightCoef,
        upperSize.weightCoef,
        lowerSize.maxWeight,
        upperSize.maxWeight,
        weight
      );

      return sizeCoef * weightCoef;
    }

    const lastSize = this.sizePricing[this.sizePricing.length - 1];

    const widthCoef = Math.pow(1.03, (width - lastSize.width) / lastSize.width);
    const heightCoef = Math.pow(1.03, (height - lastSize.height) / lastSize.height);
    const depthCoef = Math.pow(1.03, (depth - lastSize.depth) / lastSize.depth);
    const weightCoef = Math.pow(1.05, (weight - lastSize.maxWeight) / lastSize.maxWeight);

    const totalSizeCoef = lastSize.sizeCoef * widthCoef * heightCoef * depthCoef;
    const totalWeightCoef = lastSize.weightCoef * weightCoef;

    return totalSizeCoef * totalWeightCoef;
  }

  private calculateDistanceCoef(distance: number): number {
    const distanceInThousands = Math.ceil(distance / 10000);
    return Math.pow(1.005, distanceInThousands);
  }

  public calculateCost(
    width: number,
    height: number,
    depth: number,
    weight: number,
    distance: number,
    isStrict: boolean
  ): number {
    let sizeCoef: number;

    if (isStrict) {
      sizeCoef = this.calculateStrictSizeCoef(width, height, depth, weight);
    } else {
      sizeCoef = this.calculateInterpolatedSizeCoef(width, height, depth, weight);
    }

    const distanceCoef = this.calculateDistanceCoef(distance);
    return this.baseCost * sizeCoef * distanceCoef;
  }
}
