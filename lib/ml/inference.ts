import { MLModel } from './types';

let _model: MLModel | null = null;

export function loadModel(model: MLModel): void {
  _model = model;
}

export function isModelLoaded(): boolean {
  return _model !== null;
}

function standardize(value: number, mean: number, std: number): number {
  return std > 0 ? (value - mean) / std : 0;
}

function relu(x: number): number {
  return Math.max(0, x);
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function activate(x: number, activation: 'relu' | 'sigmoid'): number {
  return activation === 'relu' ? relu(x) : sigmoid(x);
}

export function predict(features: Record<string, number>): {
  probability: number;
  prediction: number;
  aboveThreshold: boolean;
} {
  if (!_model) {
    return { probability: 0.5, prediction: 0, aboveThreshold: false };
  }

  // Build input vector in model's feature order
  const input: number[] = [];
  for (const name of _model.feature_names) {
    const val = features[name] ?? 0;
    const idx = _model.feature_names.indexOf(name);
    input.push(standardize(val, _model.mean[idx], _model.std[idx]));
  }

  // Forward pass through layers
  let layerOutput = input;
  for (const layer of _model.layers) {
    const next: number[] = [];
    for (let j = 0; j < layer.weights[0].length; j++) {
      let sum = layer.bias[j];
      for (let i = 0; i < layerOutput.length; i++) {
        sum += layerOutput[i] * layer.weights[i][j];
      }
      next.push(activate(sum, layer.activation));
    }
    layerOutput = next;
  }

  // Final output is sigmoid probability
  const probability = layerOutput[0];
  const threshold = _model.metadata.decision_threshold;
  const prediction = probability >= threshold ? 1 : 0;

  return {
    probability,
    prediction,
    aboveThreshold: prediction === 1,
  };
}

export function getModelThreshold(): number {
  return _model?.metadata.decision_threshold ?? 0.63;
}

export function predictDirection(
  features: Record<string, number>,
): { direction: 'LONG' | 'SHORT' | 'NEUTRAL'; probability: number; confidence: number } {
  const result = predict(features);
  const threshold = getModelThreshold();

  // probability >= threshold → confident UP (LONG)
  if (result.probability >= threshold) {
    const confidence = (result.probability - threshold) / (1 - threshold);
    return { direction: 'LONG', probability: result.probability, confidence };
  }

  // probability <= 1 - threshold → confident DOWN (SHORT)
  if (result.probability <= 1 - threshold) {
    const downProb = 1 - result.probability;
    const confidence = (downProb - threshold) / (1 - threshold);
    return { direction: 'SHORT', probability: downProb, confidence };
  }

  return { direction: 'NEUTRAL', probability: result.probability, confidence: 0 };
}
